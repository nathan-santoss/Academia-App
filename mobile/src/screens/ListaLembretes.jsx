// Listo os lembretes locais, mostro seus avisos e permito excluir uma anotação.
import { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Aviso from '../components/Aviso';
import Botao from '../components/Botao';
import BotaoLink from '../components/BotaoLink';
import { excluirLembrete, listarLembretes } from '../services/lembrete-servico';
import { apresentarHorario } from '../utils/formatar-data';
import { estilos } from '../theme/tema';

export default function ListaLembretes() {
    const [lembretes, definirLembretes] = useState([]);
    const [carregando, definirCarregando] = useState(true);
    const [excluindo, definirExcluindo] = useState(false);
    const [erro, definirErro] = useState('');
    const [aviso, definirAviso] = useState('');
    const exclusaoEmAndamento = useRef(false);
    const telaAtiva = useRef(false);
    const numeroConsulta = useRef(0);

    const atualizarLista = useCallback(async function carregarLista() {
        // Identifico a consulta para uma resposta antiga não substituir a mais recente.
        numeroConsulta.current += 1;
        const consulta = numeroConsulta.current;
        definirCarregando(true);
        definirErro('');
        definirAviso('');

        try {
            const resultado = await listarLembretes();

            if (telaAtiva.current && consulta === numeroConsulta.current) {
                definirLembretes(resultado.dados);
                definirAviso(resultado.aviso);
            }
        } catch {
            if (telaAtiva.current && consulta === numeroConsulta.current) {
                definirErro('Não consegui carregar os lembretes deste aparelho.');
            }
        } finally {
            if (telaAtiva.current && consulta === numeroConsulta.current) {
                definirCarregando(false);
            }
        }
    }, []);

    // Consulto novamente ao voltar do cadastro ou de outra aba.
    useFocusEffect(useCallback(function acompanharTela() {
        telaAtiva.current = true;
        atualizarLista();

        return function sairDaLista() {
            telaAtiva.current = false;
            numeroConsulta.current += 1;
        };
    }, [atualizarLista]));

    async function remover(id) {
        // Protejo a exclusão de toques repetidos enquanto o sistema cancela o aviso.
        if (exclusaoEmAndamento.current || !telaAtiva.current) {
            return;
        }

        exclusaoEmAndamento.current = true;
        definirExcluindo(true);
        definirErro('');

        try {
            await excluirLembrete(id);

            if (telaAtiva.current) {
                atualizarLista();
            }
        } catch {
            if (telaAtiva.current) {
                definirErro('Não consegui concluir a exclusão. Atualize a lista antes de tentar novamente.');
            }
        } finally {
            exclusaoEmAndamento.current = false;
            definirExcluindo(false);
        }
    }

    function confirmarExclusao(lembrete) {
        // Peço confirmação porque esta ação apaga o lembrete e cancela seu aviso.
        Alert.alert('Excluir lembrete?', lembrete.titulo, [
            {
                text: 'Manter',
                style: 'cancel',
            },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: function confirmar() {
                    remover(lembrete.id);
                },
            },
        ]);
    }

    function apresentarLembrete({ item }) {
        return (
            <View style={estilos.cartao}>
                <Text style={estilos.subtitulo}>{item.titulo}</Text>
                <Text style={estilos.texto}>{apresentarHorario(item.dataHora)}</Text>
                <Text style={estilos.descricao}>{item.situacao}</Text>
                <Botao
                    titulo="Excluir"
                    secundario
                    desabilitado={excluindo || carregando}
                    aoPressionar={function escolherLembrete() {
                        confirmarExclusao(item);
                    }}
                />
            </View>
        );
    }

    function apresentarListaVazia() {
        if (carregando || erro) {
            return null;
        }

        return <Text style={estilos.descricao}>Você ainda não tem lembretes. Crie o primeiro para organizar sua rotina.</Text>;
    }

    return (
        <SafeAreaView
            style={estilos.tela}
            edges={['left', 'right']}
        >
            {/* Reutilizo a lista nativa para apresentar os registros sem montar todas as linhas de uma vez. */}
            <FlatList
                data={lembretes}
                keyExtractor={function identificarItem(item) {
                    return String(item.id);
                }}
                renderItem={apresentarLembrete}
                contentContainerStyle={estilos.conteudo}
                ListEmptyComponent={apresentarListaVazia}
                ListHeaderComponent={
                    <View style={estilos.grupo}>
                        <Text style={estilos.etiqueta}>SUA ROTINA</Text>
                        <Text style={estilos.titulo}>Lembretes</Text>
                        <Text style={estilos.descricao}>Suas anotações ficam neste aparelho e podem ser consultadas sem internet.</Text>
                        <BotaoLink
                            titulo="Novo lembrete"
                            destino="/lembretes/novo"
                        />
                        <Aviso mensagem={aviso} />
                        <Aviso
                            mensagem={erro}
                            erro
                            aoTentar={atualizarLista}
                        />
                        {carregando && (
                            <Aviso
                                mensagem="Carregando lembretes…"
                                carregando
                            />
                        )}
                        {excluindo && (
                            <Aviso
                                mensagem="Excluindo lembrete…"
                                carregando
                            />
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    );
}
