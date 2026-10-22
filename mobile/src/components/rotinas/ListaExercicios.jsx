import { ScrollView, Text, View } from 'react-native';
import AcaoRotina from './AcaoRotina';
import { resumoExercicio } from '../../utils/formulario-rotina';
import { visualRotina as visual } from '../../theme/rotina';

export default function ListaExercicios({ exercicios, aoEditar, aoRemover, limitarAltura = false }) {
    const conteudo = exercicios.map(function mostrar(exercicio, posicao) {
        return (
            <View
                key={exercicio.id}
                style={visual.cartao}
            >
                <Text style={visual.nome}>{posicao + 1 + '. ' + exercicio.nome}</Text>
                <Text style={visual.detalhe}>{exercicio.equipamento}</Text>
                <Text style={visual.detalhe}>{resumoExercicio(exercicio)}</Text>
                <View style={visual.linha}>
                    <AcaoRotina
                        titulo="Editar"
                        descricao={exercicio.nome}
                        secundaria
                        aoPressionar={function editar() { aoEditar(exercicio); }}
                    />
                    <AcaoRotina
                        titulo="Remover"
                        descricao={exercicio.nome}
                        secundaria
                        aoPressionar={function remover() { aoRemover(exercicio); }}
                    />
                </View>
            </View>
        );
    });
    if (limitarAltura) {
        // Limito apenas a lista na ficha da equipe, mantendo a ação de adicionar próxima.
        return (
            <ScrollView
                style={visual.listaEmbutida}
                contentContainerStyle={visual.grupo}
                nestedScrollEnabled
            >
                {conteudo}
            </ScrollView>
        );
    }
    return <View style={visual.grupo}>{conteudo}</View>;
}
