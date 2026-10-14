import { Text, View } from 'react-native';
import Botao from './Botao';
import { estilos } from '../theme/tema';

export default function ResumoRotina({ rotina, aoIniciar, bloqueado }) {
    if (!rotina) { return null; }
    let origem = 'Pessoal / adaptada pelo aluno';
    if (rotina.origem === 'recomendada') { origem = 'Recomendada pelo instrutor'; }
    return (
        <View style={estilos.cartao}>
            <Text style={estilos.etiqueta}>{origem}</Text>
            <Text style={estilos.subtitulo}>{rotina.conteudo.nome}</Text>
            <Text style={estilos.descricao}>{'Versão ' + rotina.versao + ' • ' + new Date(rotina.criadoEm).toLocaleDateString('pt-BR')}</Text>
            {rotina.conteudo.divisoes.map(function mostrar(divisao) {
                return (
                    <View
                        key={divisao.id}
                        style={estilos.grupo}
                    >
                        <Text style={estilos.subtitulo}>{divisao.nome}</Text>
                        {divisao.exercicios.map(function exercicio(item) {
                            let medida = ' repetições';
                            if (item.tipo === 'duracao') { medida = ' segundos'; }
                            return (
                                <Text
                                    key={item.id}
                                    style={estilos.texto}
                                >{item.nome + ' • ' + item.equipamento + ' • ' + item.series + ' × ' + item.meta + medida}</Text>
                            );
                        })}
                        <Botao
                            titulo={'Iniciar ' + divisao.nome}
                            desabilitado={bloqueado}
                            aoPressionar={function iniciar() { aoIniciar(rotina, divisao); }}
                        />
                    </View>
                );
            })}
        </View>
    );
}
