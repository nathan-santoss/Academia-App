import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useEdicaoExercicio } from '../contexts/EdicaoExercicioContext';
import EditorExercicio from '../components/EditorExercicio';
import SelecionarExercicio from '../components/SelecionarExercicio';
import AcaoRotina from '../components/rotinas/AcaoRotina';
import { novoExercicio } from '../utils/editar-rotina';
import { erroExercicio } from '../utils/formulario-rotina';
import { visualRotina as visual } from '../theme/rotina';

function voltar() {
    if (router.canGoBack()) { router.back(); }
    else { router.replace('/treinos/rotina'); }
}

export default function ExercicioRotina() {
    const { sessao, confirmar, encerrar } = useEdicaoExercicio();
    // Conservo a sessão de abertura até o fim da animação de retorno.
    const [edicao] = useState(sessao);
    const [exercicio, definirExercicio] = useState(function iniciar() {
        if (edicao && edicao.exercicio) { return Object.assign({}, edicao.exercicio); }
        return null;
    });
    const [alterado, definirAlterado] = useState(false);
    const [erro, definirErro] = useState('');
    const concluido = useRef(false);
    const lista = useRef(null);

    useEffect(function acompanhar() {
        return function sair() {
            if (edicao) { encerrar(edicao.dono, edicao); }
        };
    }, [edicao, encerrar]);

    const cancelar = useCallback(function cancelar() {
        if (!alterado) { voltar(); return; }
        Alert.alert('Descartar este exercício?', 'Os exercícios já adicionados à rotina serão mantidos.', [
            {
                text: 'Continuar editando',
                style: 'cancel',
            },
            {
                text: 'Descartar',
                style: 'destructive',
                onPress: voltar,
            },
        ]);
    }, [alterado]);

    useFocusEffect(useCallback(function acompanharVoltar() {
        const assinatura = BackHandler.addEventListener('hardwareBackPress', function voltarAndroid() {
            cancelar();
            return true;
        });
        return function remover() { assinatura.remove(); };
    }, [cancelar]));

    function escolher(item = null) {
        definirExercicio(novoExercicio(item));
        definirAlterado(true);
        definirErro('');
        if (lista.current) {
            lista.current.scrollTo({
                y: 0,
                animated: false,
            });
        }
    }

    function adicionar() {
        if (concluido.current || !edicao || !exercicio) { return; }
        const aviso = erroExercicio(exercicio);
        if (aviso) { definirErro(aviso); return; }
        try {
            confirmar(edicao, exercicio);
            concluido.current = true;
            voltar();
        } catch (falha) { definirErro(falha.message); }
    }

    if (!edicao) {
        return (
            <SafeAreaView style={visual.tela}>
                <View style={visual.conteudo}>
                    <Text style={visual.titulo}>Abra um treino para adicionar exercícios</Text>
                    <AcaoRotina
                        titulo="Voltar às rotinas"
                        aoPressionar={voltar}
                    />
                </View>
            </SafeAreaView>
        );
    }

    let titulo = 'Escolher exercício';
    let tituloAcao = 'Adicionar exercício';
    if (exercicio) { titulo = 'Configurar exercício'; }
    if (edicao.exercicio) {
        titulo = 'Editar exercício';
        tituloAcao = 'Salvar alterações';
    }
    /** @type {'padding' | 'height'} */
    let comportamento = 'height';
    if (Platform.OS === 'ios') { comportamento = 'padding'; }

    return (
        <SafeAreaView style={visual.tela}>
            <KeyboardAvoidingView
                style={visual.tela}
                behavior={comportamento}
            >
                <View style={visual.conteudo}>
                    <View style={visual.linha}>
                        <AcaoRotina
                            titulo="Cancelar"
                            secundaria
                            aoPressionar={cancelar}
                        />
                        <View style={visual.expandir}>
                            <Text style={visual.nome}>{titulo}</Text>
                            <Text style={visual.detalhe}>{edicao.treino}</Text>
                        </View>
                    </View>
                </View>
                <ScrollView
                    ref={lista}
                    contentContainerStyle={visual.conteudo}
                    keyboardShouldPersistTaps="handled"
                >
                    {!exercicio && (
                        <SelecionarExercicio
                            aoSelecionar={escolher}
                            aoManual={function manual() { escolher(); }}
                        />
                    )}
                    {exercicio && (
                        <EditorExercicio
                            exercicio={exercicio}
                            aoAlterar={function editar(novo) {
                                definirExercicio(novo);
                                definirAlterado(true);
                                definirErro('');
                            }}
                        />
                    )}
                </ScrollView>
                {exercicio && (
                    <View style={visual.rodape}>
                        {Boolean(erro) && (
                            <Text
                                style={visual.erro}
                                accessibilityLiveRegion="polite"
                            >{erro}</Text>
                        )}
                        <AcaoRotina
                            titulo={tituloAcao}
                            aoPressionar={adicionar}
                        />
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
