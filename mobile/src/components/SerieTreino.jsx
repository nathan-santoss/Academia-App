import { useState } from 'react';
import { Text, View } from 'react-native';
import Campo from './Campo';
import Botao from './Botao';
import { estilos } from '../theme/tema';

export default function SerieTreino({ exercicio, numero, serie, bloqueado, aoSalvar, aoDesmarcar }) {
    let cargaInicial = '';
    let realizadoInicial = '';
    if (serie) {
        cargaInicial = String(serie.carga);
        realizadoInicial = String(serie.realizado);
    }
    const [carga, definirCarga] = useState(cargaInicial);
    const [realizado, definirRealizado] = useState(realizadoInicial);
    const [erro, definirErro] = useState('');
    let medida = 'Repetições realizadas';
    let titulo = 'Marcar série feita';
    if (exercicio.tipo === 'duracao') { medida = 'Segundos realizados'; }
    if (serie) { titulo = 'Corrigir série feita'; }

    function salvar() {
        const peso = Number(carga.replace(',', '.'));
        const quantidade = Number(realizado);
        if (!carga.trim() || !Number.isFinite(peso) || peso < 0 || peso > 2000 || !Number.isInteger(quantidade) || quantidade < 1 || quantidade > 36000) {
            definirErro('Informe a carga em kg (0 para sem carga externa) e a quantidade realizada.');
            return;
        }
        definirErro('');
        aoSalvar({
            exercicioId: exercicio.id,
            numero: numero,
            carga: peso,
            realizado: quantidade,
        });
    }

    return (
        <View style={estilos.cartao}>
            <Text style={estilos.subtitulo}>{'Série ' + numero}</Text>
            {serie && <Text style={estilos.sucesso}>Marcada como feita</Text>}
            <Campo
                rotulo={'Carga realizada em kg — ' + exercicio.referenciaCarga}
                value={carga}
                onChangeText={definirCarga}
                keyboardType="decimal-pad"
                editable={!bloqueado}
            />
            <Campo
                rotulo={medida}
                value={realizado}
                onChangeText={definirRealizado}
                keyboardType="number-pad"
                editable={!bloqueado}
            />
            {Boolean(erro) && <Text style={estilos.erro}>{erro}</Text>}
            <Botao
                titulo={titulo}
                desabilitado={bloqueado}
                aoPressionar={salvar}
            />
            {serie && (
                <Botao
                    titulo="Desmarcar série"
                    secundario
                    desabilitado={bloqueado}
                    aoPressionar={aoDesmarcar}
                />
            )}
        </View>
    );
}
