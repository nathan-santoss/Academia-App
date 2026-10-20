import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Botao from './Botao';
import Paginacao from './Paginacao';
import EstadoConsulta from './EstadoConsulta';
import useConsulta from '../hooks/useConsulta';
import { estilos } from '../theme/tema';

export default function VersoesFicha({ alunoId, ocupado, aoRestaurar }) {
    const [pagina, definirPagina] = useState(0);
    const consulta = useConsulta('/equipe/alunos/' + alunoId + '/ficha/versoes?pagina=' + pagina);
    const versoes = consulta.dados || [];
    return (
        <View style={estilos.grupo}>
            <Text style={estilos.subtitulo}>Versões publicadas</Text>
            <EstadoConsulta consulta={consulta} />
            {!consulta.carregando && !consulta.erro && !versoes.length && (
                <Text style={estilos.descricao}>Nenhuma ficha publicada.</Text>
            )}
            {versoes.map(function mostrar(versao) {
                return (
                    <View
                        key={versao.id}
                        style={estilos.cartao}
                    >
                        <Text style={estilos.texto}>{versao.conteudo.nome + ' · versão ' + versao.versao}</Text>
                        <Text style={estilos.descricao}>{new Date(versao.criadoEm).toLocaleString('pt-BR')}</Text>
                        {versao.conteudo.divisoes.map(function resumir(divisao) {
                            return (
                                <Text
                                    key={divisao.id}
                                    style={estilos.descricao}
                                >{divisao.nome + ': ' + divisao.exercicios.map(function nome(item) { return item.nome; }).join(', ')}</Text>
                            );
                        })}
                        <Botao
                            titulo="Restaurar como rascunho"
                            secundario
                            desabilitado={ocupado}
                            aoPressionar={function confirmar() {
                                Alert.alert('Restaurar versão ' + versao.versao + '?', 'O rascunho será substituído. Revise e publique separadamente para alterar a ficha do aluno.', [
                                    {
                                        text: 'Cancelar',
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Restaurar',
                                        onPress: function restaurar() { aoRestaurar(versao); },
                                    },
                                ]);
                            }}
                        />
                    </View>
                );
            })}
            <Paginacao
                pagina={pagina}
                quantidade={versoes.length}
                ocupado={ocupado || consulta.carregando}
                aoAlterar={definirPagina}
            />
        </View>
    );
}
