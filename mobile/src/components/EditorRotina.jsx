import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useEdicaoExercicio } from '../contexts/EdicaoExercicioContext';
import { novaDivisao } from '../utils/editar-rotina';
import { aplicarExercicio, completarNomesRotina, nomeDivisao, sugerirNomeDivisao } from '../utils/formulario-rotina';
import AcaoRotina from './rotinas/AcaoRotina';
import CampoRotina from './rotinas/CampoRotina';
import OrganizarItens from './rotinas/OrganizarItens';
import ListaExercicios from './rotinas/ListaExercicios';
import { visualRotina as visual } from '../theme/rotina';

export default function EditorRotina({ rotina, aoAlterar, telaCompleta = false, cabecalho = null, rodape = null, desabilitado = false }) {
    const [selecionada, definirSelecionada] = useState('');
    const [configurar, definirConfigurar] = useState(false);
    const [organizar, definirOrganizar] = useState('');
    const { iniciar, encerrar } = useEdicaoExercicio();
    const dono = useRef({});
    const atual = useRef({
        rotina: rotina,
        aoAlterar: aoAlterar,
    });
    useEffect(function atualizar() {
        atual.current = {
            rotina: rotina,
            aoAlterar: aoAlterar,
        };
    }, [rotina, aoAlterar]);
    useEffect(function acompanharEditor() {
        const identificador = dono.current;
        return function sair() { encerrar(identificador); };
    }, [encerrar]);

    let divisao = rotina.divisoes.find(function encontrar(item) { return item.id === selecionada; });
    if (!divisao) { divisao = rotina.divisoes[0]; }
    const indice = rotina.divisoes.indexOf(divisao);
    let titulo = 'Novo treino';
    if (divisao) { titulo = nomeDivisao(divisao, indice); }

    function alterarDivisao(nova) {
        aoAlterar(Object.assign({}, rotina, {
            divisoes: rotina.divisoes.map(function atualizar(item) {
                if (item.id === nova.id) { return nova; }
                return item;
            }),
        }));
    }

    function editarExercicio(exercicio = null) {
        if (!divisao || desabilitado) { return; }
        const divisaoId = divisao.id;
        const iniciou = iniciar({
            dono: dono.current,
            exercicio: exercicio,
            treino: titulo,
            aoConfirmar: function confirmar(editado) {
                const ultima = atual.current;
                ultima.aoAlterar(aplicarExercicio(ultima.rotina, divisaoId, editado, !exercicio));
            },
        });
        if (iniciou) { router.push('/treinos/exercicio'); }
    }

    function adicionarDivisao() {
        if (rotina.divisoes.length >= 10) { return; }
        const nova = novaDivisao();
        nova.nome = sugerirNomeDivisao(rotina.divisoes);
        aoAlterar(Object.assign({}, completarNomesRotina(rotina), {
            divisoes: completarNomesRotina(rotina).divisoes.concat(nova),
        }));
        definirSelecionada(nova.id);
        definirConfigurar(false);
    }

    function excluirDivisao() {
        Alert.alert('Excluir ' + titulo + '?', 'Os exercícios deste treino sairão da rotina.', [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: function excluir() {
                    aoAlterar(Object.assign({}, rotina, {
                        divisoes: rotina.divisoes.filter(function manter(item) { return item.id !== divisao.id; }),
                    }));
                    definirSelecionada('');
                    definirConfigurar(false);
                },
            },
        ]);
    }

    function excluirExercicio(exercicio) {
        Alert.alert('Remover exercício?', exercicio.nome + ' será removido deste treino.', [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Remover',
                style: 'destructive',
                onPress: function remover() {
                    alterarDivisao(Object.assign({}, divisao, {
                        exercicios: divisao.exercicios.filter(function manter(item) { return item.id !== exercicio.id; }),
                    }));
                },
            },
        ]);
    }

    const adicionar = (
        <AcaoRotina
            titulo="+ Adicionar exercício"
            desabilitada={desabilitado || !divisao || divisao.exercicios.length >= 30}
            aoPressionar={function abrir() { editarExercicio(); }}
        />
    );

    let itensOrdenados = [];
    if (organizar === 'treinos') { itensOrdenados = completarNomesRotina(rotina).divisoes; }
    else if (divisao) { itensOrdenados = divisao.exercicios; }

    const conteudo = (
        <View style={visual.grupo}>
            {cabecalho}
            <CampoRotina
                rotulo="Nome da rotina"
                valor={rotina.nome}
                exemplo="Minha rotina"
                aoAlterar={function nome(texto) {
                    aoAlterar(Object.assign({}, rotina, {
                        nome: texto,
                    }));
                }}
            />
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator
                contentContainerStyle={visual.abas}
            >
                {rotina.divisoes.map(function mostrar(item, posicao) {
                    return (
                        <AcaoRotina
                            key={item.id}
                            titulo={nomeDivisao(item, posicao)}
                            secundaria
                            selecionada={divisao.id === item.id}
                            aoPressionar={function escolher() {
                                definirSelecionada(item.id);
                                definirConfigurar(false);
                            }}
                        />
                    );
                })}
                <AcaoRotina
                    titulo="+ Treino"
                    secundaria
                    desabilitada={rotina.divisoes.length >= 10}
                    aoPressionar={adicionarDivisao}
                />
            </ScrollView>
            {divisao && (
                <View style={visual.grupo}>
                    <View style={visual.linha}>
                        <View style={visual.expandir}>
                            <Text style={visual.nome}>{titulo}</Text>
                            <Text style={visual.detalhe}>{divisao.exercicios.length + ' de 30 exercícios'}</Text>
                        </View>
                        <AcaoRotina
                            titulo="Opções"
                            descricao="Renomear, organizar ou excluir treinos"
                            secundaria
                            aoPressionar={function abrir() { definirConfigurar(!configurar); }}
                        />
                    </View>
                    {configurar && (
                        <View style={visual.cartao}>
                            <CampoRotina
                                rotulo="Nome do treino"
                                valor={divisao.nome}
                                exemplo={titulo}
                                limite={60}
                                aoAlterar={function renomear(nome) {
                                    alterarDivisao(Object.assign({}, divisao, {
                                        nome: nome,
                                    }));
                                }}
                            />
                            <View style={visual.linha}>
                                <AcaoRotina
                                    titulo="Ordenar exercícios"
                                    secundaria
                                    desabilitada={divisao.exercicios.length < 2}
                                    aoPressionar={function ordenar() { definirOrganizar('exercicios'); }}
                                />
                                <AcaoRotina
                                    titulo="Ordenar treinos"
                                    secundaria
                                    desabilitada={rotina.divisoes.length < 2}
                                    aoPressionar={function ordenar() { definirOrganizar('treinos'); }}
                                />
                                <AcaoRotina
                                    titulo="Excluir treino"
                                    secundaria
                                    aoPressionar={excluirDivisao}
                                />
                            </View>
                        </View>
                    )}
                    {!telaCompleta && adicionar}
                    {divisao.exercicios.length === 0 && (
                        <View style={visual.cartao}>
                            <Text style={visual.nome}>Seu treino começa aqui</Text>
                            <Text style={visual.detalhe}>Adicione um exercício, escolha os detalhes e monte sua lista.</Text>
                        </View>
                    )}
                    <ListaExercicios
                        exercicios={divisao.exercicios}
                        aoEditar={editarExercicio}
                        aoRemover={excluirExercicio}
                        limitarAltura={!telaCompleta}
                    />
                </View>
            )}
            {!divisao && <Text style={visual.detalhe}>Toque em “+ Treino” para começar.</Text>}
            {Boolean(organizar) && (
                <OrganizarItens
                    itens={itensOrdenados}
                    aoFechar={function fechar() { definirOrganizar(''); }}
                    aoConfirmar={function confirmar(lista) {
                        if (organizar === 'treinos') {
                            // Fixo os nomes para preservar cada treino ao trocar sua posição.
                            aoAlterar(Object.assign({}, rotina, {
                                divisoes: lista,
                            }));
                        } else {
                            alterarDivisao(Object.assign({}, divisao, {
                                exercicios: lista,
                            }));
                        }
                        definirOrganizar('');
                    }}
                />
            )}
        </View>
    );

    /** @type {'auto' | 'none'} */
    let eventos = 'auto';
    if (desabilitado) { eventos = 'none'; }
    if (!telaCompleta) { return <View pointerEvents={eventos}>{conteudo}</View>; }
    return (
        <View style={visual.tela}>
            <ScrollView
                pointerEvents={eventos}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={visual.conteudo}
            >
                {conteudo}
            </ScrollView>
            <View style={visual.rodape}>
                {adicionar}
                {rodape}
            </View>
        </View>
    );
}
