import { useState } from 'react';
import { Text, View } from 'react-native';
import Botao from './Botao';
import Paginacao from './Paginacao';
import EstadoConsulta from './EstadoConsulta';
import useConsulta from '../hooks/useConsulta';
import { estilos } from '../theme/tema';

export default function ListaModelos({ aoSelecionar }) {
    const [pagina, definirPagina] = useState(0);
    const consulta = useConsulta('/modelos-treino?pagina=' + pagina);
    const modelos = consulta.dados || [];
    return (
        <View style={estilos.grupo}>
            <Text style={estilos.subtitulo}>Modelos de treino</Text>
            <EstadoConsulta consulta={consulta} />
            {!consulta.carregando && !consulta.erro && modelos.length === 0 && (
                <Text style={estilos.descricao}>Nenhum modelo disponível nesta página.</Text>
            )}
            {modelos.map(function mostrar(modelo) {
                let origem = 'Privado do autor';
                if (modelo.oficial) { origem = 'Oficial'; }
                return (
                    <View
                        key={modelo.id}
                        style={estilos.cartao}
                    >
                        <Text style={estilos.texto}>{modelo.conteudo.nome}</Text>
                        <Text style={estilos.descricao}>{origem + ' · ' + modelo.conteudo.divisoes.length + ' divisões · revisão ' + modelo.revisao}</Text>
                        <Botao
                            titulo="Selecionar modelo"
                            secundario
                            aoPressionar={function escolher() { aoSelecionar(modelo); }}
                        />
                    </View>
                );
            })}
            <Paginacao
                pagina={pagina}
                quantidade={modelos.length}
                ocupado={consulta.carregando}
                aoAlterar={definirPagina}
            />
        </View>
    );
}
