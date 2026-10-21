import { useState } from 'react';
import { Text, View } from 'react-native';
import Botao from './Botao';
import EstadoConsulta from './EstadoConsulta';
import Paginacao from './Paginacao';
import useConsulta from '../hooks/useConsulta';
import { estilos } from '../theme/tema';

export default function FilaChegadas({ aoSelecionar }) {
    const [pagina, definirPagina] = useState(0);
    const consulta = useConsulta('/equipe/chegadas?pagina=' + pagina);
    const fila = consulta.dados || [];
    return (
        <View style={estilos.grupo}>
            <Text style={estilos.subtitulo}>Aguardando recepção</Text>
            <EstadoConsulta consulta={consulta} />
            {!consulta.carregando && !consulta.erro && !fila.length && (
                <Text style={estilos.descricao}>Nenhuma chegada aguardando nesta página.</Text>
            )}
            {fila.map(function mostrar(item) {
                if (!item.aluno) { return null; }
                return (
                    <Botao
                        key={item.id}
                        titulo={item.aluno.nome + ' · ' + item.aluno.matricula}
                        secundario
                        aoPressionar={function escolher() { aoSelecionar(item.aluno); }}
                    />
                );
            })}
            <Paginacao
                pagina={pagina}
                quantidade={fila.length}
                ocupado={consulta.carregando}
                aoAlterar={definirPagina}
            />
        </View>
    );
}
