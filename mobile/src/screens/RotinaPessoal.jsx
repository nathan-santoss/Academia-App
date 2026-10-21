import { useEffect, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import TelaFormulario from '../components/TelaFormulario';
import { router } from 'expo-router';
import { useAcesso } from '../contexts/AcessoContext';
import EditorRotina from '../components/EditorRotina';
import Botao from '../components/Botao';
import { consultarRotinas, salvarRotina } from '../services/treino-servico';
import { lerRascunho, guardarRascunho, apagarRascunho } from '../services/rascunho-treino-servico';
import { novaDivisao, prepararRotina } from '../utils/editar-rotina';
import { estilos } from '../theme/tema';

export default function RotinaPessoal() {
    const { usuario } = useAcesso();
    const trava = useRef(false);
    const [tentativa, definirTentativa] = useState(0);
    const [rotina, definirRotina] = useState(null);
    const [recomendada, definirRecomendada] = useState(null);
    const [ocupado, definirOcupado] = useState(false);
    const [mensagem, definirMensagem] = useState('Carregando rotina…');

    useEffect(function carregar() {
        let ativa = true;
        async function consultar() {
            try {
                const rascunho = await lerRascunho(usuario.id, 'rotina');
                if (rascunho && ativa) {
                    definirRotina(rascunho);
                    definirMensagem('Rascunho local recuperado. Salve para confirmar na academia.');
                }
                const dados = await consultarRotinas();
                if (!ativa) { return; }
                definirRecomendada(dados.recomendada);
                if (!rascunho) {
                    let inicial = {
                        nome: '',
                        divisoes: [novaDivisao()],
                        versaoAnterior: 0,
                    };
                    if (dados.pessoal) {
                        inicial = Object.assign({}, dados.pessoal.conteudo, {
                            versaoAnterior: dados.pessoal.versao,
                        });
                    }
                    definirRotina(inicial);
                    definirMensagem('');
                }
            } catch (falha) {
                if (ativa) { definirMensagem(falha.message); }
            }
        }
        consultar();
        return function sair() { ativa = false; };
    }, [usuario.id, tentativa]);

    function editar(nova) {
        definirRotina(nova);
        guardarRascunho(usuario.id, 'rotina', nova).catch(function falhou(falha) {
            definirMensagem('Não foi possível proteger o rascunho no aparelho: ' + falha.message);
        });
    }

    async function salvar() {
        if (trava.current) { return; }
        trava.current = true;
        definirOcupado(true);
        let protegido = false;
        try {
            await guardarRascunho(usuario.id, 'rotina', rotina);
            protegido = true;
            const entrada = Object.assign({}, prepararRotina(rotina), {
                ciente: true,
                substituir: true,
            });
            await salvarRotina(entrada);
            await apagarRascunho(usuario.id, 'rotina');
            router.back();
        } catch (falha) {
            let aviso = ' Não feche esta tela até conseguir salvar no aparelho.';
            if (protegido) { aviso = ' Seu rascunho foi mantido.'; }
            definirMensagem(falha.message + aviso);
        } finally {
            trava.current = false;
            definirOcupado(false);
        }
    }

    function confirmar() {
        try { prepararRotina(rotina); }
        catch (falha) { definirMensagem(falha.message); return; }
        let mensagem = 'Esta rotina é criada/adaptada por você, não é uma prescrição profissional. Procure orientação presencial em caso de dúvida.';
        if (rotina.versaoAnterior > 0) {
            mensagem += ' Confirma substituir sua rotina pessoal atual? O histórico de treinos será preservado.';
        }
        Alert.alert('Salvar rotina pessoal', mensagem, [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Estou ciente. Salvar',
                onPress: salvar,
            },
        ]);
    }

    function copiar() {
        Alert.alert('Copiar recomendada?', 'Isso substitui este rascunho. A cópia será pessoal e independente de futuras publicações do instrutor.', [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Copiar',
                onPress: function substituir() {
                    editar(Object.assign({}, recomendada.conteudo, {
                        versaoAnterior: rotina.versaoAnterior,
                    }));
                },
            },
        ]);
    }

    function recarregar() {
        Alert.alert('Recuperar rotina do servidor?', 'Esta ação substitui o rascunho desta tela pela rotina pessoal confirmada mais recente. Use para recomeçar após um conflito, conferindo suas alterações antes.', [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Recuperar versão confirmada',
                onPress: async function consultarAtual() {
                    definirOcupado(true);
                    try {
                        const dados = await consultarRotinas();
                        if (!dados.pessoal) {
                            definirMensagem('Ainda não há rotina pessoal confirmada. Seu rascunho foi mantido.');
                            return;
                        }
                        const atual = Object.assign({}, dados.pessoal.conteudo, {
                            versaoAnterior: dados.pessoal.versao,
                        });
                        await guardarRascunho(usuario.id, 'rotina', atual);
                        definirRotina(atual);
                        definirRecomendada(dados.recomendada);
                        definirMensagem('Versão confirmada recuperada. Você pode editar e salvar novamente.');
                    } catch (falha) {
                        definirMensagem(falha.message);
                    } finally {
                        definirOcupado(false);
                    }
                },
            },
        ]);
    }

    /** @type {'auto' | 'none'} */
    let eventos = 'auto';
    if (ocupado) {
        eventos = 'none';
    }

    return (
        <TelaFormulario>
            <Text style={estilos.titulo}>Minha rotina pessoal</Text>
            <Text style={estilos.descricao}>Organize suas divisões e exercícios. A ficha do instrutor permanece separada.</Text>
            <Text
                accessibilityLiveRegion="polite"
                style={estilos.descricao}
            >{mensagem}</Text>
            {!rotina && (
                <Botao
                    titulo="Tentar carregar rotina novamente"
                    aoPressionar={function repetir() { definirTentativa(tentativa + 1); }}
                />
            )}
            {rotina && (
                <View
                    pointerEvents={eventos}
                    style={estilos.grupo}
                >
                    {recomendada && (
                        <Botao
                            titulo="Copiar rotina recomendada"
                            secundario
                            aoPressionar={copiar}
                        />
                    )}
                    <EditorRotina
                        rotina={rotina}
                        aoAlterar={editar}
                    />
                    <Botao
                        titulo="Salvar rotina"
                        desabilitado={ocupado}
                        aoPressionar={confirmar}
                    />
                    <Botao
                        titulo="Recuperar versão confirmada"
                        secundario
                        desabilitado={ocupado}
                        aoPressionar={recarregar}
                    />
                </View>
            )}
        </TelaFormulario>
    );
}
