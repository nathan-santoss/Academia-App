import { Alert, Text, View } from 'react-native';
import Campo from './Campo';
import Botao from './Botao';
import EditorExercicio from './EditorExercicio';
import { novaDivisao, novoExercicio, moverItem } from '../utils/editar-rotina';
import { estilos } from '../theme/tema';

export default function EditorRotina({ rotina, aoAlterar }) {
    function alterarDivisao(indice, divisao) {
        const divisoes = rotina.divisoes.slice();
        divisoes[indice] = divisao;
        aoAlterar(Object.assign({}, rotina, {
            divisoes: divisoes,
        }));
    }

    function alterarExercicios(indice, exercicios) {
        alterarDivisao(indice, Object.assign({}, rotina.divisoes[indice], {
            exercicios: exercicios,
        }));
    }

    function adicionarExercicio(indice) {
        const divisao = rotina.divisoes[indice];
        if (divisao.exercicios.length >= 30) {
            Alert.alert('Limite da divisão', 'Use até 30 exercícios por divisão.');
            return;
        }
        alterarExercicios(indice, divisao.exercicios.concat(novoExercicio()));
    }

    function adicionarDivisao() {
        aoAlterar(Object.assign({}, rotina, {
            divisoes: rotina.divisoes.concat(novaDivisao()),
        }));
    }

    return (
        <View style={estilos.grupo}>
            <Campo
                rotulo="Nome da rotina"
                value={rotina.nome}
                onChangeText={function nome(texto) {
                    aoAlterar(Object.assign({}, rotina, {
                        nome: texto,
                    }));
                }}
            />
            {rotina.divisoes.map(function mostrarDivisao(divisao, indice) {
                return (
                    <View
                        key={divisao.id}
                        style={estilos.grupo}
                    >
                        <Text style={estilos.subtitulo}>{'Divisão ' + (indice + 1)}</Text>
                        <Campo
                            rotulo="Nome da divisão (A, B, pernas…)"
                            value={divisao.nome}
                            onChangeText={function nome(texto) {
                                alterarDivisao(indice, Object.assign({}, divisao, {
                                    nome: texto,
                                }));
                            }}
                        />
                        <Botao
                            titulo="Subir divisão"
                            secundario
                            aoPressionar={function subir() {
                                aoAlterar(Object.assign({}, rotina, {
                                    divisoes: moverItem(rotina.divisoes, indice, -1),
                                }));
                            }}
                        />
                        <Botao
                            titulo="Descer divisão"
                            secundario
                            aoPressionar={function descer() {
                                aoAlterar(Object.assign({}, rotina, {
                                    divisoes: moverItem(rotina.divisoes, indice, 1),
                                }));
                            }}
                        />
                        {divisao.exercicios.map(function mostrarExercicio(exercicio, posicao) {
                            return (
                                <EditorExercicio
                                    key={exercicio.id}
                                    exercicio={exercicio}
                                    aoAlterar={function editar(novo) {
                                        const exercicios = divisao.exercicios.slice();
                                        exercicios[posicao] = novo;
                                        alterarExercicios(indice, exercicios);
                                    }}
                                    aoRemover={function remover() {
                                        alterarExercicios(indice, divisao.exercicios.filter(function manter(item) { return item.id !== exercicio.id; }));
                                    }}
                                    aoSubir={function subir() { alterarExercicios(indice, moverItem(divisao.exercicios, posicao, -1)); }}
                                    aoDescer={function descer() { alterarExercicios(indice, moverItem(divisao.exercicios, posicao, 1)); }}
                                />
                            );
                        })}
                        <Text style={estilos.descricao}>Confira variação e equipamento. Exercícios repetidos são permitidos quando intencionais; prefira nomes distintos nas divisões.</Text>
                        <Botao
                            titulo="Adicionar exercício"
                            secundario
                            aoPressionar={function adicionar() { adicionarExercicio(indice); }}
                        />
                        <Botao
                            titulo="Excluir divisão"
                            secundario
                            aoPressionar={function confirmarExclusao() {
                                Alert.alert('Excluir divisão?', 'Os exercícios desta divisão sairão do rascunho.', [
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
                                        },
                                    },
                                ]);
                            }}
                        />
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
