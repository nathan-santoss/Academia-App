import { useState } from 'react';
import { Text, View } from 'react-native';
import useConsulta from '../hooks/useConsulta';
import EstadoConsulta from './EstadoConsulta';
import Paginacao from './Paginacao';
import { dataDia } from '../utils/apresentar-dados';
import { estilos } from '../theme/tema';

export default function MedidasCompartilhadas({ alunoId }) {
    const [pagina, definirPagina] = useState(0);
    const consulta = useConsulta('/medidas/alunos/' + alunoId + '?pagina=' + pagina);
    const medidas = consulta.dados || [];
    return (
        <View style={estilos.grupo}>
            <Text style={estilos.subtitulo}>Medidas compartilhadas</Text>
            <EstadoConsulta consulta={consulta} />
            {!consulta.carregando && !consulta.erro && !medidas.length && (
                <Text style={estilos.descricao}>Nenhuma medida registrada nesta página.</Text>
            )}
            {medidas.map(function mostrar(item) {
                let unidade = 'kg';
                if (item.tipo === 'altura') { unidade = 'cm'; }
                return (
                    <Text
                        key={item.id}
                        style={estilos.texto}
                    >{dataDia(item.dia) + ' · ' + item.valor + ' ' + unidade}</Text>
                );
            })}
            <Paginacao
                pagina={pagina}
                quantidade={medidas.length}
                ocupado={consulta.carregando}
                aoAlterar={definirPagina}
            />
        </View>
    );
}
