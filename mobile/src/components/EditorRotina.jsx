import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import SelecionarExercicio from './SelecionarExercicio';
import Campo from './Campo';
import CampoSelecao from './CampoSelecao';
import Botao from './Botao';
import EditorExercicio from './EditorExercicio';
import { novaDivisao, novoExercicio, posicionarItem } from '../utils/editar-rotina';
import { estilos } from '../theme/tema';
import { editor } from '../theme/editor';

export default function EditorRotina({ rotina, aoAlterar }) {
    const [divisaoCatalogo, definirDivisaoCatalogo] = useState('');
    const [divisaoAberta, definirDivisaoAberta] = useState('');
    function alterarDivisoes(divisoes) {
        aoAlterar(Object.assign({}, rotina, {
            divisoes: divisoes,
        }));
    }
    function alterarDivisao(indice, divisao) {
        const divisoes = rotina.divisoes.slice();
        divisoes[indice] = divisao;
        alterarDivisoes(divisoes);
    }
    function alterarExercicios(indice, exercicios) {
        alterarDivisao(indice, Object.assign({}, rotina.divisoes[indice], {
            exercicios: exercicios,
        }));
    }
    function adicionarExercicio(indice, catalogo = null) {
        const divisao = rotina.divisoes[indice];
        if (divisao.exercicios.length >= 30) {
            Alert.alert('Limite da divisão', 'Use até 30 exercícios por divisão.');
            return;
        }
        function incluir() {
            alterarExercicios(indice, divisao.exercicios.concat(novoExercicio(catalogo)));
            definirDivisaoCatalogo('');
        }
        if (catalogo && divisao.exercicios.some(function repetido(item) { return item.exercicioCatalogoId === catalogo.id; })) {
            Alert.alert('Exercício repetido', 'Este exercício já está na divisão. Deseja incluí-lo novamente?', [{
                text: 'Cancelar',
                style: 'cancel',
            }, {
                text: 'Incluir novamente',
                onPress: incluir,
            }]);
            return;
        }
        incluir();
    }
    function adicionarDivisao() {
        const nova = novaDivisao();
        alterarDivisoes(rotina.divisoes.concat(nova));
        definirDivisaoAberta(nova.id);
    }
    return (
        <View style={editor.grupo}>
            <Campo
                rotulo="Nome da rotina"
                value={rotina.nome}
                onChangeText={function nome(texto) {
                    aoAlterar(Object.assign({}, rotina, {
                        nome: texto,
                    }));
                }}
            />
            <Text style={estilos.descricao}>Abra uma divisão para editar. Use “Posição” para organizar a sequência.</Text>
            {rotina.divisoes.map(function mostrarDivisao(divisao, indice) {
                let aberta = divisaoAberta === divisao.id;
                if (!divisaoAberta && indice === 0) {
                    aberta = true;
                }
                let titulo = 'Divisão ' + (indice + 1);
                if (divisao.nome) {
                    titulo = divisao.nome;
                }
                return (
                    <View
                        key={divisao.id}
                        style={editor.grupo}
                    >
                        <Pressable
                            accessibilityRole="button"
                            accessibilityState={{
                                expanded: aberta,
                            }}
                            onPress={function abrir() {
                                if (aberta) {
                                    definirDivisaoAberta('fechada');
                                } else {
                                    definirDivisaoAberta(divisao.id);
                                }
                            }}
                            style={editor.seletor}
                        >
                            <Text style={editor.valor}>{titulo + ' · ' + divisao.exercicios.length + ' exercícios'}</Text>
                            <Text style={editor.seta}>⌄</Text>
                        </Pressable>
                        {aberta && (
                            <View style={editor.grupo}>
                                <View style={editor.campos}>
                                    <CampoSelecao
                                        rotulo="Nome da divisão"
                                        emLinha
                                        valor={divisao.nome}
                                        opcoes={['A', 'B', 'C', 'D', 'E', 'F', 'Superior', 'Inferior', 'Corpo inteiro']}
                                        permitirOutro
                                        aoAlterar={function nome(texto) {
                                            alterarDivisao(indice, Object.assign({}, divisao, {
                                                nome: texto,
                                            }));
                                        }}
                                    />
                                    <CampoSelecao
                                        rotulo="Posição da divisão"
                                        emLinha
                                        valor={String(indice + 1)}
                                        opcoes={rotina.divisoes.map(function posicao(_item, numero) { return String(numero + 1); })}
                                        aoAlterar={function posicionar(valor) {
                                            alterarDivisoes(posicionarItem(rotina.divisoes, indice, Number(valor) - 1));
                                        }}
                                    />
                                </View>
                                {divisao.exercicios.map(function mostrarExercicio(exercicio, posicao) {
                                    return (
                                        <EditorExercicio
                                            key={exercicio.id}
                                            exercicio={exercicio}
                                            posicao={posicao}
                                            quantidade={divisao.exercicios.length}
                                            aoAlterar={function editar(novo) {
                                                const exercicios = divisao.exercicios.slice();
                                                exercicios[posicao] = novo;
                                                alterarExercicios(indice, exercicios);
                                            }}
                                            aoRemover={function remover() {
                                                alterarExercicios(indice, divisao.exercicios.filter(function manter(item) { return item.id !== exercicio.id; }));
                                            }}
                                            aoReordenar={function posicionar(destino) {
                                                alterarExercicios(indice, posicionarItem(divisao.exercicios, posicao, destino));
                                            }}
                                        />
                                    );
                                })}
                                <Botao
                                    titulo="Escolher exercício"
                                    desabilitado={divisao.exercicios.length >= 30}
                                    aoPressionar={function abrirCatalogo() { definirDivisaoCatalogo(divisao.id); }}
                                />
                                {divisaoCatalogo === divisao.id && (
                                    <SelecionarExercicio
                                        aoSelecionar={function selecionar(item) { adicionarExercicio(indice, item); }}
                                        aoCancelar={function fechar() { definirDivisaoCatalogo(''); }}
                                    />
                                )}
                                <Botao
                                    titulo="Criar exercício manual"
                                    secundario
                                    desabilitado={divisao.exercicios.length >= 30}
                                    aoPressionar={function adicionar() { adicionarExercicio(indice); }}
                                />
                                <Botao
                                    titulo="Excluir divisão"
                                    secundario
                                    aoPressionar={function confirmar() {
                                        Alert.alert('Excluir divisão?', 'Os exercícios serão retirados deste rascunho.', [{
                                            text: 'Cancelar',
                                            style: 'cancel',
                                        }, {
                                            text: 'Excluir',
                                            style: 'destructive',
                                            onPress: function excluir() {
                                                alterarDivisoes(rotina.divisoes.filter(function manter(item) { return item.id !== divisao.id; }));
                                                definirDivisaoAberta('');
                                            },
                                        }]);
                                    }}
                                />
                            </View>
                        )}
                    </View>
                );
            })}
            <Botao
                titulo="Adicionar divisão"
                secundario
                desabilitado={rotina.divisoes.length >= 10}
                aoPressionar={adicionarDivisao}
            />
        </View>
    );
}
