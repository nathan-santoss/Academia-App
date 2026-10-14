// Preparo a ficha recomendada do aluno selecionado: primeiro salvo um rascunho, depois confirmo a publicação.
// Deixo o acompanhamento em outro componente para consultar os treinos sem mexer neste formulário.
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import EditorRotina from './EditorRotina';
import AcompanhamentoAluno from './AcompanhamentoAluno';
import Botao from './Botao';
import { consultarFicha, enviarAcao } from '../services/equipe-servico';
import { novaDivisao, prepararRotina } from '../utils/editar-rotina';
import { estilos } from '../theme/tema';

export default function FichaAluno({ aluno }) {
    const [formulario, definirFormulario] = useState(null);
    const [revisao, definirRevisao] = useState(0);
    const [versaoBase, definirVersaoBase] = useState(0);
    const [tentativa, definirTentativa] = useState(0);
    const [mensagem, definirMensagem] = useState('Carregando ficha…');
    const [ocupado, definirOcupado] = useState(true);
    const [alterado, definirAlterado] = useState(true);
    const [publicada, definirPublicada] = useState(null);

    useEffect(function carregar() {
        let ativa = true;
        async function consultar() {
            definirOcupado(true);
            try {
                // Busco a ficha sozinha: uma falha no histórico não deve impedir a prescrição.
                const dados = await consultarFicha(aluno.id);
                if (!ativa) { return; }
                definirPublicada(dados.publicada);
                let conteudo = {
                    nome: '',
                    divisoes: [novaDivisao()],
                };
                if (dados.publicada) {
                    conteudo = dados.publicada.conteudo;
                    definirVersaoBase(dados.publicada.versao);
                }
                if (dados.rascunho) {
                    definirRevisao(dados.rascunho.revisao);
                    if (!dados.rascunho.publicadaId) {
                        conteudo = dados.rascunho.conteudo;
                        definirVersaoBase(dados.rascunho.versaoBase);
                        definirAlterado(false);
                    }
                }
                definirFormulario(conteudo);
                definirMensagem('Revise a identidade e salve o rascunho antes de publicar.');
            } catch (falha) { if (ativa) { definirMensagem(falha.message); } }
            finally { if (ativa) { definirOcupado(false); } }
        }
        consultar();
        return function sair() { ativa = false; };
    }, [aluno.id, tentativa]);

    async function salvar() {
        definirOcupado(true);
        try {
            // Envio a revisão junto do conteúdo para não apagar uma edição feita em outro aparelho.
            const dados = Object.assign({}, prepararRotina(formulario), {
                revisao: revisao,
                versaoBase: versaoBase,
            });
            const salvo = await enviarAcao(aluno.id, 'ficha/rascunho', dados, 'PUT');
            definirRevisao(salvo.revisao);
            definirAlterado(false);
            definirMensagem('Rascunho salvo. A ficha do aluno só muda quando você publicar.');
        } catch (falha) { definirMensagem(falha.message); }
        finally { definirOcupado(false); }
    }

    async function publicar() {
        definirOcupado(true);
        try {
            // Confirmo o aluno pelo identificador, além do nome mostrado no aviso da tela.
            const resultado = await enviarAcao(aluno.id, 'ficha/publicar', {
                revisao: revisao,
                confirmarAlunoId: aluno.id,
            });
            definirPublicada(resultado);
            definirVersaoBase(resultado.versao);
            definirAlterado(true);
            definirMensagem('Ficha publicada. Versão ' + resultado.versao + ' disponível para o aluno.');
        } catch (falha) { definirMensagem(falha.message); }
        finally { definirOcupado(false); }
    }

    function confirmarPublicacao() {
        Alert.alert('Publicar ficha?', 'Aluno: ' + aluno.nome + ' — ' + aluno.matricula + '. A rotina pessoal e os treinos em andamento serão preservados.', [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Confirmar aluno e publicar',
                onPress: publicar,
            },
        ]);
    }

    function atualizarBase() {
        Alert.alert('Recomeçar pela ficha atual?', 'Confira primeiro o trabalho publicado por outro instrutor. Este rascunho será substituído na tela; salve para confirmar.', [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Carregar ficha atual',
                onPress: async function carregarAtual() {
                    definirOcupado(true);
                    try {
                        const dados = await consultarFicha(aluno.id);
                        if (dados.publicada) {
                            definirFormulario(dados.publicada.conteudo);
                            definirVersaoBase(dados.publicada.versao);
                            definirPublicada(dados.publicada);
                        }
                        if (dados.rascunho) { definirRevisao(dados.rascunho.revisao); }
                        definirAlterado(true);
                    } catch (falha) { definirMensagem(falha.message); }
                    finally { definirOcupado(false); }
                },
            },
        ]);
    }

    /** @type {'auto' | 'none'} */
    let eventos = 'auto';
    if (ocupado) { eventos = 'none'; }
    return (
        <View style={estilos.grupo}>
            <Text style={estilos.subtitulo}>Ficha recomendada</Text>
            {publicada && <Text style={estilos.descricao}>{'Publicada: versão ' + publicada.versao + ' em ' + new Date(publicada.criadoEm).toLocaleString('pt-BR')}</Text>}
            <Text style={estilos.descricao}>{mensagem}</Text>
            {!formulario && !ocupado && (
                <Botao
                    titulo="Tentar carregar ficha novamente"
                    aoPressionar={function repetir() { definirTentativa(tentativa + 1); }}
                />
            )}
            {formulario && (
                <View
                    style={estilos.grupo}
                    pointerEvents={eventos}
                >
                    <EditorRotina
                        rotina={formulario}
                        aoAlterar={function editar(nova) { definirFormulario(nova); definirAlterado(true); }}
                    />
                    <Botao
                        titulo="Salvar rascunho"
                        desabilitado={ocupado}
                        aoPressionar={salvar}
                    />
                    <Botao
                        titulo="Publicar para este aluno"
                        desabilitado={ocupado || alterado}
                        aoPressionar={confirmarPublicacao}
                    />
                    <Botao
                        titulo="Recomeçar pela ficha publicada"
                        secundario
                        desabilitado={ocupado}
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
