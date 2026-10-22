import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import TelaFormulario from '../components/TelaFormulario';
import EstadoConsulta from '../components/EstadoConsulta';
import EnvioPendente from '../components/EnvioPendente';
import SerieTreino from '../components/SerieTreino';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import CampoSelecao from '../components/CampoSelecao';
import useConsulta from '../hooks/useConsulta';
import useGravacao from '../hooks/useGravacao';
import { estilos } from '../theme/tema';

function EditorCorrecao({ treino }) {
    const [series, definirSeries] = useState(treino.series);
    const [motivo, definirMotivo] = useState('');
    const [posicao, definirPosicao] = useState('1');
    const gravacao = useGravacao('correcao-' + treino.id);
    const exercicios = treino.referencia.divisao.exercicios;
    const exercicio = exercicios[Number(posicao) - 1];
    function restantes(numero) {
        return series.filter(function manter(item) { return item.exercicioId !== exercicio.id || item.numero !== numero; });
    }
    function salvar() {
        Alert.alert('Confirmar correção?', 'O motivo e as alterações serão registrados. Somente séries marcadas como feitas serão mantidas.', [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Salvar correção',
                onPress: async function confirmar() {
                    const resultado = await gravacao.enviar('/treinos/' + treino.id + '/correcao', 'PUT', {
                        revisao: treino.revisao,
                        motivo: motivo,
                        series: series,
                    });
                    if (resultado) { router.back(); }
                },
            },
        ]);
    }
    return (
        <View style={estilos.grupo}>
            <Text style={estilos.subtitulo}>{treino.referencia.nome + ' · ' + treino.referencia.divisao.nome}</Text>
            <Text style={estilos.descricao}>Ajuste apenas o que foi realizado. Marque ou corrija cada série antes de salvar a correção completa.</Text>
            <CampoSelecao
                rotulo="Posição do exercício"
                valor={posicao}
                opcoes={exercicios.map(function numero(_item, indice) { return String(indice + 1); })}
                aoAlterar={definirPosicao}
            />
            <Text style={estilos.texto}>{exercicio.nome + ' · ' + exercicio.equipamento}</Text>
            {Array.from({
                length: exercicio.series,
            }, function mostrar(_valor, indice) {
                const numero = indice + 1;
                const serie = series.find(function encontrar(item) { return item.exercicioId === exercicio.id && item.numero === numero; });
                return (
                    <SerieTreino
                        key={exercicio.id + ':' + numero + ':' + JSON.stringify(serie)}
                        exercicio={exercicio}
                        numero={numero}
                        serie={serie}
                        bloqueado={gravacao.ocupado}
                        aoSalvar={function editar(registro) {
                            definirSeries(restantes(numero).concat(registro));
                        }}
                        aoDesmarcar={function remover() { definirSeries(restantes(numero)); }}
                    />
                );
            })}
            <Campo
                rotulo="Motivo da correção"
                value={motivo}
                onChangeText={definirMotivo}
                maxLength={500}
                editable={!gravacao.ocupado}
            />
            <Botao
                titulo="Salvar correção do treino"
                desabilitado={gravacao.ocupado || !motivo.trim()}
                aoPressionar={salvar}
            />
            <EnvioPendente
                gravacao={gravacao}
                aoConfirmar={function voltar() { router.back(); }}
            />
        </View>
    );
}

export default function CorrigirTreino() {
    const { id } = useLocalSearchParams();
    let caminho = '';
    if (typeof id === 'string') { caminho = '/treinos/' + encodeURIComponent(id); }
    const consulta = useConsulta(caminho);
    return (
        <TelaFormulario>
            <Text style={estilos.titulo}>Corrigir treino encerrado</Text>
            <EstadoConsulta consulta={consulta} />
            {consulta.dados && consulta.dados.estado !== 'ativo' && (
                <EditorCorrecao
                    key={consulta.dados.id + ':' + consulta.dados.revisao}
                    treino={consulta.dados}
                />
            )}
            {consulta.dados && consulta.dados.estado === 'ativo' && (
                <Text style={estilos.descricao}>Este treino está ativo. Use a tela de execução.</Text>
            )}
        </TelaFormulario>
    );
}
