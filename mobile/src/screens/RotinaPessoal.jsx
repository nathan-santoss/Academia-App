import { useEffect, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAcesso } from '../contexts/AcessoContext';
import EditorRotina from '../components/EditorRotina';
import AcaoRotina from '../components/rotinas/AcaoRotina';
import { consultarRotinas, salvarRotina } from '../services/treino-servico';
import { lerRascunho, guardarRascunho, apagarRascunho } from '../services/rascunho-treino-servico';
import { novaDivisao, prepararRotina } from '../utils/editar-rotina';
import { visualRotina as visual } from '../theme/rotina';
import { erroRotina } from '../utils/formulario-rotina';

export default function RotinaPessoal() {
    const { usuario } = useAcesso();
    const [opcoes, definirOpcoes] = useState(false);
    const salvando = useRef(false);
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
    }, [usuario.id]);

    function editar(nova) {
        definirRotina(nova);
        guardarRascunho(usuario.id, 'rotina', nova).catch(function falhou(falha) {
            definirMensagem('Não foi possível proteger o rascunho no aparelho: ' + falha.message);
        });
    }

    async function salvar() {
        if (salvando.current) { return; }
        salvando.current = true;
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
            salvando.current = false;
            definirOcupado(false);
        }
    }

    function confirmar() {
        if (ocupado) { return; }
        const aviso = erroRotina(rotina);
        if (aviso) { Alert.alert('Confira a rotina', aviso); return; }
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

    const cabecalho = (
        <View style={visual.grupo}>
            {Boolean(mensagem) && (
                <Text
                    accessibilityLiveRegion="polite"
                    style={visual.detalhe}
                >{mensagem}</Text>
            )}
            <View style={visual.linha}>
                <Text style={[visual.detalhe, visual.expandir]}>Monte um treino de cada vez.</Text>
                <AcaoRotina
                    titulo="Mais opções"
                    secundaria
                    aoPressionar={function abrir() { definirOpcoes(!opcoes); }}
                />
            </View>
            {opcoes && (
                <View style={visual.cartao}>
                    {recomendada && (
                        <AcaoRotina
                            titulo="Copiar rotina recomendada"
                            secundaria
                            aoPressionar={copiar}
                        />
                    )}
                    <AcaoRotina
                        titulo="Recuperar versão confirmada"
                        secundaria
                        desabilitada={ocupado}
                        aoPressionar={recarregar}
                    />
                    <Text style={visual.detalhe}>A ficha do instrutor permanece separada da sua rotina pessoal.</Text>
                </View>
            )}
        </View>
    );
    let tituloSalvar = 'Salvar rotina';
    if (ocupado) { tituloSalvar = 'Aguarde…'; }
    const rodape = (
        <AcaoRotina
            titulo={tituloSalvar}
            secundaria
            desabilitada={ocupado}
            aoPressionar={confirmar}
        />
    );

    return (
        <SafeAreaView
            style={visual.tela}
            edges={['bottom', 'left', 'right']}
        >
            {!rotina && (
                <View style={visual.conteudo}>
                    <Text
                        style={visual.detalhe}
                        accessibilityLiveRegion="polite"
                    >{mensagem}</Text>
                </View>
            )}
            {rotina && (
                <EditorRotina
                    rotina={rotina}
                    aoAlterar={editar}
                    telaCompleta
                    cabecalho={cabecalho}
                    rodape={rodape}
                    desabilitado={ocupado}
                />
            )}
        </SafeAreaView>
    );
}
