// Recebo título e horário do lembrete e ofereço o agendamento de um aviso local.
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import Aviso from '../components/Aviso';
import Botao from '../components/Botao';
import Campo from '../components/Campo';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { cadastrarLembrete } from '../services/lembrete-servico';
import { prepararLembrete } from '../utils/validar-lembrete';
import { apresentarHorario, preencherData, preencherHora } from '../utils/formatar-data';
import { vibrarAoConcluir } from '../utils/vibracao';
import { cores, estilos } from '../theme/tema';

export default function CadastroLembrete() {
    const { vibracaoAtiva } = usePreferencias();
    const alturaCabecalho = useHeaderHeight();

    // Separo os campos para acompanhar cada alteração do formulário.
    const [titulo, definirTitulo] = useState('');
    const [data, definirData] = useState('');
    const [hora, definirHora] = useState('');
    const [avisar, definirAvisar] = useState(true);
    const [salvando, definirSalvando] = useState(false);
    const [erro, definirErro] = useState('');
    const [resultado, definirResultado] = useState(null);
    const envioEmAndamento = useRef(false);
    const telaAberta = useRef(true);
    const rolagem = useRef(null);

    // Evito atualizar o formulário depois que a pessoa sair desta tela.
    useEffect(function acompanharTela() {
        telaAberta.current = true;

        return function sairDaTela() {
            telaAberta.current = false;
        };
    }, []);

    function mostrarErro(mensagem) {
        definirErro(mensagem);

        // Levo a mensagem até a parte visível sem apagar os campos preenchidos.
        if (rolagem.current) {
            rolagem.current.scrollTo({
                y: 0,
                animated: true,
            });
        }
    }

    async function salvar() {
        // Bloqueio um segundo envio para preservar um único registro por cadastro.
        if (envioEmAndamento.current || resultado) {
            return;
        }

        const dados = prepararLembrete(titulo, data, hora);

        if (dados.mensagem) {
            mostrarErro(dados.mensagem);
            return;
        }

        envioEmAndamento.current = true;
        definirSalvando(true);
        definirErro('');

        try {
            const salvo = await cadastrarLembrete(dados, avisar);

            if (telaAberta.current) {
                // Confirmo a gravação mesmo quando o sistema não autoriza o aviso.
                definirResultado(salvo);
                vibrarAoConcluir(vibracaoAtiva);
            }
        } catch {
            if (telaAberta.current) {
                mostrarErro('Não consegui salvar o lembrete. Tente novamente.');
            }
        } finally {
            envioEmAndamento.current = false;

            if (telaAberta.current) {
                definirSalvando(false);
            }
        }
    }

    function voltarParaLista() {
        // Fecho o formulário concluído para evitar um novo envio ao voltar.
        router.dismissTo('/lembretes');
    }

    if (resultado) {
        return (
            <SafeAreaView
                style={estilos.tela}
                edges={['bottom', 'left', 'right']}
            >
                <ScrollView contentContainerStyle={estilos.conteudo}>
                    <Text style={estilos.etiqueta}>LEMBRETE SALVO</Text>
                    <Text style={estilos.titulo}>{resultado.lembrete.titulo}</Text>
                    <View style={estilos.cartao}>
                        <Text style={estilos.texto}>{apresentarHorario(resultado.lembrete.dataHora)}</Text>
                        <Text style={estilos.descricao}>{resultado.mensagem}</Text>
                    </View>
                    <Botao
                        titulo="Voltar aos lembretes"
                        aoPressionar={voltarParaLista}
                    />
                </ScrollView>
            </SafeAreaView>
        );
    }

    let textoBotao = 'Salvar lembrete';

    if (salvando) {
        textoBotao = 'Salvando lembrete…';
    }

    return (
        <SafeAreaView
            style={estilos.tela}
            edges={['bottom', 'left', 'right']}
        >
            {/* Ajusto a posição do formulário quando o teclado do iOS aparece. */}
            <KeyboardAvoidingView
                style={estilos.tela}
                behavior="padding"
                enabled={Platform.OS === 'ios'}
                keyboardVerticalOffset={alturaCabecalho}
            >
                <ScrollView
                    ref={rolagem}
                    contentContainerStyle={estilos.conteudo}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={estilos.etiqueta}>SUA ROTINA</Text>
                    <Text style={estilos.titulo}>Novo lembrete</Text>
                    <Text style={estilos.descricao}>Anote algo para lembrar depois. Este lembrete fica apenas neste aparelho.</Text>
                    <Aviso
                        mensagem={erro}
                        erro
                    />
                    <Campo
                        rotulo="Título *"
                        value={titulo}
                        onChangeText={definirTitulo}
                        maxLength={100}
                        editable={!salvando}
                        placeholder="Ex.: levar a garrafa de água"
                    />
                    <Campo
                        rotulo="Data *"
                        value={data}
                        onChangeText={function alterarData(valor) {
                            definirData(preencherData(valor));
                        }}
                        keyboardType="number-pad"
                        maxLength={10}
                        editable={!salvando}
                        placeholder="DD/MM/AAAA"
                    />
                    <Campo
                        rotulo="Horário *"
                        value={hora}
                        onChangeText={function alterarHora(valor) {
                            definirHora(preencherHora(valor));
                        }}
                        keyboardType="number-pad"
                        maxLength={5}
                        editable={!salvando}
                        placeholder="HH:MM"
                    />
                    <View style={estilos.cartao}>
                        <View style={estilos.linha}>
                            <Text style={[estilos.texto, estilos.expandir]}>Avisar neste aparelho</Text>
                            <Switch
                                accessibilityLabel="Avisar neste aparelho"
                                value={avisar}
                                onValueChange={definirAvisar}
                                disabled={salvando}
                                trackColor={{
                                    false: cores.borda,
                                    true: cores.destaque,
                                }}
                            />
                        </View>
                        <Text style={estilos.descricao}>Ao salvar, pediremos permissão se necessário. Sem permissão, a anotação continua disponível aqui. O aviso será silencioso.</Text>
                    </View>
                    <Text style={estilos.descricao}>Use o horário local do aparelho. A entrega do aviso depende das permissões e dos ajustes do sistema.</Text>
                    <Botao
                        titulo={textoBotao}
                        aoPressionar={salvar}
                        desabilitado={salvando}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
