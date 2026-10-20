import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import Campo from './Campo';
import Botao from './Botao';
import CampoSelecao from './CampoSelecao';
import { estilos } from '../theme/tema';
import { editor } from '../theme/editor';

export default function EditorExercicio({ exercicio, aoAlterar, aoRemover, posicao, quantidade, aoReordenar }) {
    const [aberto, definirAberto] = useState(!exercicio.series);
    function alterar(nome, valor) {
        aoAlterar(Object.assign({}, exercicio, {
            [nome]: valor,
        }));
    }
    function campo(rotulo, nome, numerico = false) {
        let teclado = 'default';
        let valor = '';
        if (numerico) {
            teclado = 'decimal-pad';
        }
        if (exercicio[nome] !== null && exercicio[nome] !== undefined) {
            valor = String(exercicio[nome]);
        }
        return (
            <Campo
                rotulo={rotulo}
                value={valor}
                keyboardType={teclado}
                onChangeText={function editar(texto) { alterar(nome, texto); }}
            />
        );
    }
    function selecao(rotulo, nome, opcoes, numerico = false) {
        let teclado = 'default';
        if (numerico) {
            teclado = 'number-pad';
        }
        return (
            <CampoSelecao
                rotulo={rotulo}
                valor={exercicio[nome]}
                opcoes={opcoes}
                permitirOutro
                teclado={teclado}
                emLinha={numerico}
                aoAlterar={function editar(valor) { alterar(nome, valor); }}
            />
        );
    }
    let nome = 'Novo exercício';
    if (exercicio.nome) {
        nome = exercicio.nome;
    }
    let tipo = 'Repetições';
    let rotuloMeta = 'Repetições';
    let metas = ['6', '8', '10', '12', '15', '20'];
    if (exercicio.tipo === 'duracao') {
        tipo = 'Duração';
        rotuloMeta = 'Duração (s)';
        metas = ['20', '30', '45', '60', '90', '120'];
    }
    let resumo = 'Toque para configurar';
    if (exercicio.series && exercicio.meta) {
        resumo = exercicio.series + ' séries · ' + exercicio.meta + ' ' + tipo.toLowerCase();
    }
    return (
        <View style={editor.cartao}>
            <Pressable
                accessibilityRole="button"
                accessibilityState={{
                    expanded: aberto,
                }}
                accessibilityLabel={nome + '. ' + resumo}
                onPress={function alternar() { definirAberto(!aberto); }}
                style={editor.cabecalho}
            >
                <Text style={estilos.texto}>{posicao + 1 + '. ' + nome}</Text>
                <Text style={estilos.descricao}>{resumo}</Text>
            </Pressable>
            {aberto && (
                <View style={editor.grupo}>
                    {campo('Nome e variação', 'nome')}
                    {selecao('Equipamento', 'equipamento', ['Peso corporal', 'Halteres', 'Barra', 'Máquina', 'Polia', 'Elástico', 'Kettlebell'])}
                    {selecao('Referência da carga', 'referenciaCarga', ['total em kg', 'por lado em kg', 'por halter em kg', 'peso corporal'])}
                    <CampoSelecao
                        rotulo="Medida do exercício"
                        valor={tipo}
                        opcoes={['Repetições', 'Duração']}
                        aoAlterar={function mudarTipo(valor) {
                            let novoTipo = 'repeticoes';
                            if (valor === 'Duração') {
                                novoTipo = 'duracao';
                            }
                            if (novoTipo !== exercicio.tipo) {
                                aoAlterar(Object.assign({}, exercicio, {
                                    tipo: novoTipo,
                                    meta: '',
                                }));
                            }
                        }}
                    />
                    <View style={editor.campos}>
                        {selecao('Séries', 'series', ['1', '2', '3', '4', '5', '6'], true)}
                        {selecao(rotuloMeta, 'meta', metas, true)}
                        {selecao('Descanso (s)', 'descanso', ['0', '30', '45', '60', '90', '120', '180'], true)}
                    </View>
                    {campo('Carga em kg (opcional)', 'carga', true)}
                    {campo('Observações (opcional)', 'observacoes')}
                    <CampoSelecao
                        rotulo="Posição na divisão"
                        valor={String(posicao + 1)}
                        opcoes={Array.from({
                            length: quantidade,
                        }, function numero(_item, indice) { return String(indice + 1); })}
                        aoAlterar={function posicionar(valor) { aoReordenar(Number(valor) - 1); }}
                    />
                    <Botao
                        titulo="Remover exercício"
                        secundario
                        aoPressionar={function confirmar() {
                            Alert.alert('Remover exercício?', nome + ' será retirado deste rascunho.', [{
                                text: 'Cancelar',
                                style: 'cancel',
                            }, {
                                text: 'Remover',
                                style: 'destructive',
                                onPress: aoRemover,
                            }]);
                        }}
                    />
                </View>
            )}
        </View>
    );
}
