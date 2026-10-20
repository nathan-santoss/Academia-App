// Apresento os treinos encerrados tanto para o aluno quanto para o instrutor.
// Comparo a execução com a ficha guardada naquele treino, mesmo que a rotina tenha mudado depois.
import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import Botao from './Botao';
import { estilos } from '../theme/tema';

export default function HistoricoTreinos({ treinos, permitirCorrecao = false }) {
    const [aberto, definirAberto] = useState('');
    if (treinos.length === 0) {
        return (
            <Text style={estilos.descricao}>Nenhum treino encerrado e confirmado neste período.</Text>
        );
    }
    return (
        <View style={estilos.grupo}>
            {treinos.map(function mostrar(treino) {
                // Explico o resultado sem tratar um treino parcial como se todas as séries estivessem feitas.
                let situacao = 'Parcial';
                if (treino.estado === 'completo') { situacao = 'Completo'; }
                let titulo = 'Ver execução registrada';
                if (aberto === treino.id) { titulo = 'Fechar detalhes'; }
                return (
                    <View
                        key={treino.id}
                        style={estilos.cartao}
                    >
                        <Text style={estilos.subtitulo}>{treino.referencia.nome + ' • ' + treino.referencia.divisao.nome}</Text>
                        <Text style={estilos.etiqueta}>{situacao}</Text>
                        {treino.referencia.modo === 'demonstracao' && (
                            <Text style={estilos.etiqueta}>Demonstração • não conta como presença oficial</Text>
                        )}
                        <Text style={estilos.descricao}>{'Rotina ' + treino.referencia.origem + ' • versão ' + treino.referencia.versao}</Text>
                        <Text style={estilos.descricao}>{new Date(treino.encerradoEm).toLocaleString('pt-BR') + ' • ' + treino.series.length + ' séries realizadas'}</Text>
                        <Botao
                            titulo={titulo}
                            secundario
                            aoPressionar={function alternar() {
                                if (aberto === treino.id) { definirAberto(''); }
                                else { definirAberto(treino.id); }
                            }}
                        />
                        {aberto === treino.id && permitirCorrecao && (
                            <Botao
                                titulo="Corrigir este treino"
                                secundario
                                aoPressionar={function abrirCorrecao() {
                                    router.push({
                                        pathname: '/treinos/corrigir',
                                        params: {
                                            id: treino.id,
                                        },
                                    });
                                }}
                            />
                        )}
                        {aberto === treino.id && treino.referencia.divisao.exercicios.map(function exercicio(item) {
                            const series = treino.series.filter(function selecionar(serie) { return serie.exercicioId === item.id; });
                            // Mostro a meta original ao lado do que realmente foi registrado, sem alterar nenhum dos dois.
                            let medida = ' repetições';
                            if (item.tipo === 'duracao') { medida = ' segundos'; }
                            let carga = 'sem carga sugerida';
                            if (item.carga !== null) { carga = item.carga + ' kg (' + item.referenciaCarga + ')'; }
                            return (
                                <View
                                    key={item.id}
                                    style={estilos.grupo}
                                >
                                    <Text style={estilos.texto}>{item.nome + ' • ' + item.equipamento}</Text>
                                    <Text style={estilos.descricao}>{'Planejado: ' + item.series + ' séries × ' + item.meta + medida + ', ' + carga + '.'}</Text>
                                    <Text style={estilos.descricao}>{'Realizado: ' + series.length + ' de ' + item.series + ' séries.'}</Text>
                                    {series.length === 0 && (
                                        <Text style={estilos.descricao}>Nenhuma série realizada.</Text>
                                    )}
                                    {series.map(function serie(registro) {
                                        return (
                                            <Text
                                                key={registro.numero}
                                                style={estilos.descricao}
                                            >{'Série ' + registro.numero + ': ' + registro.carga + ' kg (' + item.referenciaCarga + ') × ' + registro.realizado + medida}</Text>
                                        );
                                    })}
                                </View>
                            );
                        })}
                    </View>
                );
            })}
        </View>
    );
}
