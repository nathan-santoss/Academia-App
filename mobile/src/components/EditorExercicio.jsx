import { Text, View } from 'react-native';
import Campo from './Campo';
import Botao from './Botao';
import { estilos } from '../theme/tema';

export default function EditorExercicio({ exercicio, aoAlterar, aoRemover, aoSubir, aoDescer }) {
    function campo(rotulo, nome, numerico = false) {
        let teclado = 'default';
        let valor = '';
        if (numerico) {
            teclado = 'decimal-pad';
        }
        if (exercicio[nome] !== null) {
            valor = String(exercicio[nome]);
        }
        return (
            <Campo
                rotulo={rotulo}
                value={valor}
                keyboardType={teclado}
                onChangeText={function alterar(texto) {
                    aoAlterar(Object.assign({}, exercicio, {
                        [nome]: texto,
                    }));
                }}
            />
        );
    }

    function trocarTipo() {
        let tipo = 'repeticoes';
        if (exercicio.tipo === 'repeticoes') {
            tipo = 'duracao';
        }
        aoAlterar(Object.assign({}, exercicio, {
            tipo: tipo,
            meta: '',
        }));
    }

    let rotuloMeta = 'Repetições sugeridas';
    if (exercicio.tipo === 'duracao') {
        rotuloMeta = 'Duração sugerida (segundos)';
    }

    return (
        <View style={estilos.cartao}>
            <Text style={estilos.subtitulo}>Exercício</Text>
            {campo('Nome e variação', 'nome')}
            {campo('Equipamento (ou peso corporal)', 'equipamento')}
            {campo('Referência da carga (total / por lado / por halter)', 'referenciaCarga')}
            <Botao
                titulo={'Medida: ' + exercicio.tipo + ' — alternar'}
                secundario
                aoPressionar={trocarTipo}
            />
            {campo('Quantidade de séries', 'series', true)}
            {campo(rotuloMeta, 'meta', true)}
            {campo('Carga sugerida em kg (opcional)', 'carga', true)}
            {campo('Descanso sugerido (segundos; 0 sem descanso)', 'descanso', true)}
            {campo('Observações (opcional)', 'observacoes')}
            <Botao
                titulo="Mover para cima"
                secundario
                aoPressionar={aoSubir}
            />
            <Botao
                titulo="Mover para baixo"
                secundario
                aoPressionar={aoDescer}
            />
            <Botao
                titulo="Remover exercício"
                secundario
                aoPressionar={aoRemover}
            />
        </View>
    );
}
