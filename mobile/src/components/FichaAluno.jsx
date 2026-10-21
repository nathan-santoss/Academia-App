import { useEffect, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useAcesso } from '../contexts/AcessoContext';
import EditorRotina from './EditorRotina';
import AcompanhamentoAluno from './AcompanhamentoAluno';
import ListaModelos from './ListaModelos';
import VersoesFicha from './VersoesFicha';
import Botao from './Botao';
import { consultarFicha, enviarAcao } from '../services/equipe-servico';
import { restaurarVersao } from '../services/ficha-servico';
import { lerRascunho, guardarRascunho, apagarRascunho } from '../services/rascunho-treino-servico';
import { novaDivisao, prepararRotina } from '../utils/editar-rotina';
import { estilos } from '../theme/tema';

function documentoDoServidor(dados) {
    const documento = {
        conteudo: {
            nome: '',
            divisoes: [novaDivisao()],
        },
        revisao: 0,
        versaoBase: 0,
        alterado: true,
    };
    if (dados.publicada) {
        documento.conteudo = dados.publicada.conteudo;
        documento.versaoBase = dados.publicada.versao;
    }
    if (dados.rascunho) {
        documento.revisao = dados.rascunho.revisao;
        if (!dados.rascunho.publicadaId) {
            documento.conteudo = dados.rascunho.conteudo;
            documento.versaoBase = dados.rascunho.versaoBase;
            documento.alterado = false;
        }
    }
    return documento;
}

export default function FichaAluno({ aluno }) {
    const { usuario } = useAcesso();
    const [documento, definirDocumento] = useState(null);
    const [publicada, definirPublicada] = useState(null);
    const [mensagem, definirMensagem] = useState('');
    const [ocupado, definirOcupado] = useState(true);
    const [tentativa, definirTentativa] = useState(0);
    const [painel, definirPainel] = useState('');
    const trava = useRef(false);
    const chave = 'ficha-' + aluno.id;
    useEffect(function carregar() {
        let visivel = true;
        async function consultar() {
            definirOcupado(true);
            try {
                const local = await lerRascunho(usuario.id, chave);
                if (local && visivel) { definirDocumento(local); definirMensagem('Edição local recuperada. Confira antes de salvar ou publicar.'); }
                const dados = await consultarFicha(aluno.id);
                if (!visivel) { return; }
                definirPublicada(dados.publicada);
                if (!local) {
                    definirDocumento(documentoDoServidor(dados));
                    definirMensagem('Confira o aluno. Salvar rascunho e publicar são etapas separadas.');
                }
            } catch (falha) { if (visivel) { definirMensagem(falha.message); } }
            finally { if (visivel) { definirOcupado(false); } }
        }
        consultar();
        return function sair() { visivel = false; };
    }, [aluno.id, usuario.id, chave, tentativa]);

    async function guardar(novo) {
        await guardarRascunho(usuario.id, chave, novo);
        definirDocumento(novo);
    }
    function editar(conteudo) {
        const novo = Object.assign({}, documento, {
            conteudo: conteudo,
            alterado: true,
        });
        definirDocumento(novo);
        guardarRascunho(usuario.id, chave, novo).catch(function falhou(falha) {
            definirMensagem('Não foi possível proteger a edição no aparelho: ' + falha.message);
        });
    }
    async function executar(acao) {
        if (trava.current) { return; }
        trava.current = true;
        definirOcupado(true);
        try { await acao(); }
        catch (falha) { definirMensagem(falha.message + ' A edição continua nesta tela. Consulte o servidor para resolver conflitos.'); }
        finally { trava.current = false; definirOcupado(false); }
    }
    async function salvar() {
        await executar(async function enviar() {
            const entrada = Object.assign({}, prepararRotina(documento.conteudo), {
                revisao: documento.revisao,
                versaoBase: documento.versaoBase,
            });
            await guardarRascunho(usuario.id, chave, documento);
            let salvo;
            try { salvo = await enviarAcao(aluno.id, 'ficha/rascunho', entrada, 'PUT'); }
            catch (falha) {
                if (falha.status !== 409) { throw falha; }
                const atual = await consultarFicha(aluno.id);
                // Reconheço apenas o mesmo conteúdo confirmado após uma resposta perdida.
                if (!atual.rascunho || atual.rascunho.publicadaId || atual.rascunho.revisao !== documento.revisao + 1 || atual.rascunho.versaoBase !== documento.versaoBase || JSON.stringify(atual.rascunho.conteudo) !== JSON.stringify(prepararRotina(documento.conteudo))) {
                    throw falha;
                }
                salvo = atual.rascunho;
            }
            await guardar({
                conteudo: salvo.conteudo,
                revisao: salvo.revisao,
                versaoBase: salvo.versaoBase,
                alterado: false,
            });
            definirMensagem('Rascunho salvo. Revise e confirme a publicação para disponibilizar ao aluno.');
        });
    }
    function confirmarPublicacao() {
        Alert.alert('Publicar ficha?', aluno.nome + ' · ' + aluno.matricula + '. A rotina pessoal e os treinos em andamento serão preservados.', [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Confirmar aluno e publicar',
                onPress: function publicar() {
                    executar(async function enviar() {
                        const resultado = await enviarAcao(aluno.id, 'ficha/publicar', {
                            revisao: documento.revisao,
                            confirmarAlunoId: aluno.id,
                        });
                        definirPublicada(resultado);
                        await guardar(Object.assign({}, documento, {
                            versaoBase: resultado.versao,
                            alterado: true,
                        }));
                        definirPainel('');
                        definirMensagem('Ficha publicada. Versão ' + resultado.versao + ' disponível para o aluno.');
                    });
                },
            },
        ]);
    }
    function recarregar() {
        Alert.alert('Consultar edição confirmada?', 'O rascunho local será substituído pelo rascunho salvo no servidor, ou pela ficha atual quando não houver rascunho.', [
            {
                text: 'Manter minha edição',
                style: 'cancel',
            },
            {
                text: 'Carregar do servidor',
                onPress: function consultar() {
                    executar(async function carregar() {
                        const dados = await consultarFicha(aluno.id);
                        await apagarRascunho(usuario.id, chave);
                        definirDocumento(documentoDoServidor(dados));
                        definirPublicada(dados.publicada);
                        definirMensagem('Dados confirmados carregados.');
                    });
                },
            },
        ]);
    }
    function atualizarBase() {
        Alert.alert('Recomeçar pela ficha publicada?', 'Substituirei o conteúdo desta edição pela ficha atual. Você precisará salvar novamente.', [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Recomeçar',
                onPress: function consultar() {
                    executar(async function carregar() {
                        const dados = await consultarFicha(aluno.id);
                        const novo = documentoDoServidor(dados);
                        if (!dados.publicada) { throw new Error('Ainda não há ficha publicada.'); }
                        novo.conteudo = dados.publicada.conteudo;
                        novo.versaoBase = dados.publicada.versao;
                        novo.alterado = true;
                        await guardar(novo);
                        definirPublicada(dados.publicada);
                        definirMensagem('Ficha atual copiada para a edição. Revise e salve.');
                    });
                },
            },
        ]);
    }
    function restaurar(versao) {
        executar(async function enviar() {
            const atual = await consultarFicha(aluno.id);
            let base = 0;
            if (atual.publicada) { base = atual.publicada.versao; }
            const salvo = await restaurarVersao(aluno.id, versao.id, documento.revisao, base);
            definirPublicada(atual.publicada);
            await guardar({
                conteudo: salvo.conteudo,
                revisao: salvo.revisao,
                versaoBase: salvo.versaoBase,
                alterado: false,
            });
            definirPainel('');
            definirMensagem('Versão restaurada como rascunho. Confira antes de publicar.');
        });
    }
    /** @type {'auto' | 'none'} */
    let eventos = 'auto';
    if (ocupado) { eventos = 'none'; }
    return (
        <View style={estilos.grupo}>
            <Text style={estilos.subtitulo}>Ficha recomendada</Text>
            {publicada && (
                <Text style={estilos.descricao}>{'Publicada: versão ' + publicada.versao}</Text>
            )}
            <Text
                accessibilityLiveRegion="polite"
                style={estilos.descricao}
            >{mensagem}</Text>
            {!documento && (
                <Botao
                    titulo="Tentar carregar ficha"
                    desabilitado={ocupado}
                    aoPressionar={function repetir() { definirTentativa(tentativa + 1); }}
                />
            )}
            {documento && (
                <View
                    style={estilos.grupo}
                    pointerEvents={eventos}
                >
                    <Botao
                        titulo="Escolher um modelo"
                        secundario
                        aoPressionar={function abrir() { definirPainel('modelos'); }}
                    />
                    <Botao
                        titulo="Consultar versões anteriores"
                        secundario
                        aoPressionar={function abrir() { definirPainel('versoes'); }}
                    />
                    {painel === 'modelos' && (
                        <ListaModelos aoSelecionar={function escolher(modelo) {
                            Alert.alert('Usar este modelo?', 'Vou substituir o conteúdo do rascunho. Revise as necessidades de ' + aluno.nome + ' antes de publicar.', [
                                {
                                    text: 'Cancelar',
                                    style: 'cancel',
                                },
                                {
                                    text: 'Copiar modelo',
                                    onPress: function copiar() { editar(JSON.parse(JSON.stringify(modelo.conteudo))); definirPainel(''); },
                                },
                            ]);
                        }}
                        />
                    )}
                    {painel === 'versoes' && (
                        <VersoesFicha
                            alunoId={aluno.id}
                            ocupado={ocupado}
                            aoRestaurar={restaurar}
                        />
                    )}
                    {Boolean(painel) && (
                        <Botao
                            titulo="Fechar consulta"
                            secundario
                            aoPressionar={function fechar() { definirPainel(''); }}
                        />
                    )}
                    <EditorRotina
                        rotina={documento.conteudo}
                        aoAlterar={editar}
                    />
                    <Botao
                        titulo="Salvar rascunho"
                        desabilitado={ocupado}
                        aoPressionar={salvar}
                    />
                    <Botao
                        titulo="Publicar para este aluno"
                        desabilitado={ocupado || documento.alterado}
                        aoPressionar={confirmarPublicacao}
                    />
                    <Botao
                        titulo="Recuperar rascunho do servidor"
                        secundario
                        aoPressionar={recarregar}
                    />
                    <Botao
                        titulo="Recomeçar pela ficha publicada"
                        secundario
                        aoPressionar={atualizarBase}
                    />
                </View>
            )}
            <AcompanhamentoAluno
                key={aluno.id}
                alunoId={aluno.id}
            />
        </View>
    );
}
