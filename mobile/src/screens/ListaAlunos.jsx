// Exibo os alunos da API com busca, paginação e acesso ao cadastro.
import { useCallback, useRef, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Botao from '../components/Botao';
import BotaoLink from '../components/BotaoLink';
import Campo from '../components/Campo';
import Aviso from '../components/Aviso';
import CartaoAluno from '../components/CartaoAluno';
import { listarAlunos } from '../services/aluno-servico';
import { estilos } from '../theme/tema';

export default function ListaAlunos() {
    // Separo o texto digitado da busca aplicada ao tocar em Buscar.
    const [busca, definirBusca] = useState('');
    const [filtros, definirFiltros] = useState({
        pagina: 1,
        busca: '',
    });
    const [alunos, definirAlunos] = useState([]);
    const [total, definirTotal] = useState(0);
    const [totalPaginas, definirTotalPaginas] = useState(0);
    const [carregando, definirCarregando] = useState(true);
    const [erro, definirErro] = useState('');
    const lista = useRef(null);

    // Atualizo os dados ao voltar do cadastro ou quando a página e a busca mudam.
    useFocusEffect(useCallback(function carregarLista() {
        let telaAtiva = true;

        async function consultar() {
            definirCarregando(true);
            definirErro('');

            try {
                const resultado = await listarAlunos(filtros.pagina, filtros.busca);

                // Ignoro respostas antigas se outra consulta começou ou a tela foi fechada.
                if (telaAtiva) {
                    definirAlunos(resultado.dados);
                    definirTotal(resultado.total);
                    definirTotalPaginas(resultado.totalPaginas);
                }
            } catch (falha) {
                if (telaAtiva) {
                    definirErro(falha.message);
                }
            } finally {
                if (telaAtiva) {
                    definirCarregando(false);
                }
            }
        }

        consultar();

        return function sairDaLista() {
            telaAtiva = false;
        };
    }, [filtros]));

    function pesquisar() {
        // Reinicio a paginação para não procurar um novo nome em uma página avançada.
        definirFiltros({
            pagina: 1,
            busca: busca.trim(),
        });
    }

    function atualizar() {
        // Repito somente a consulta, preservando o filtro que já foi escolhido.
        definirFiltros(Object.assign({}, filtros));
    }

    function mudarPagina(pagina) {
        // Volto ao início da lista para apresentar os primeiros alunos da nova página.
        if (lista.current) {
            lista.current.scrollToOffset({
                offset: 0,
                animated: false,
            });
        }

        definirFiltros(Object.assign({}, filtros, {
            pagina: pagina,
        }));
    }

    function apresentarItem({ item }) {
        return <CartaoAluno aluno={item} />;
    }

    function separarItens() {
        return <View style={estilos.separador} />;
    }

    function apresentarEstado() {
        // Mostro um estado por vez para não apresentar dados antigos como resultado novo.
        if (carregando) {
            return (
                <Aviso
                    mensagem="Buscando alunos…"
                    carregando
                />
            );
        }

        if (erro) {
            return (
                <Aviso
                    mensagem={erro}
                    erro
                    aoTentar={atualizar}
                />
            );
        }

        let mensagemVazia = 'Ainda não há alunos cadastrados. Comece pelo botão Novo aluno.';

        if (filtros.busca) {
            mensagemVazia = 'Nenhum aluno encontrado. Confira o nome ou a matrícula e tente outra busca.';
        }

        return <Aviso mensagem={mensagemVazia} />;
    }

    function apresentarRodape() {
        // Disponibilizo a paginação somente depois de receber uma resposta válida.
        if (carregando || erro) {
            return null;
        }

        return (
            <View style={estilos.grupo}>
                {totalPaginas > 1 && (
                    <View style={estilos.grupo}>
                        <Text style={estilos.descricao}>Página {filtros.pagina} de {totalPaginas}</Text>
                        <View style={estilos.linha}>
                            <View style={estilos.expandir}>
                                <Botao
                                    titulo="Anterior"
                                    secundario
                                    desabilitado={filtros.pagina <= 1}
                                    aoPressionar={voltarPagina}
                                />
                            </View>
                            <View style={estilos.expandir}>
                                <Botao
                                    titulo="Próxima"
                                    secundario
                                    desabilitado={filtros.pagina >= totalPaginas}
                                    aoPressionar={avancarPagina}
                                />
                            </View>
                        </View>
                    </View>
                )}
                <Botao
                    titulo="Atualizar lista"
                    secundario
                    aoPressionar={atualizar}
                />
            </View>
        );
    }

    function voltarPagina() {
        mudarPagina(filtros.pagina - 1);
    }

    function avancarPagina() {
        mudarPagina(filtros.pagina + 1);
    }

    // Escondo resultados antigos durante uma nova consulta ou uma falha de conexão.
    let dadosVisiveis = alunos;

    if (carregando || erro) {
        dadosVisiveis = [];
    }

    // Incluo os controles na própria lista para manter a rolagem simples e eficiente.
    return (
        <SafeAreaView
            style={estilos.tela}
            edges={['left', 'right']}
        >
            <FlatList
                ref={lista}
                data={dadosVisiveis}
                renderItem={apresentarItem}
                keyExtractor={identificarAluno}
                ItemSeparatorComponent={separarItens}
                ListEmptyComponent={apresentarEstado()}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={estilos.conteudo}
                ListHeaderComponent={
                    <View style={estilos.grupo}>
                        <Text style={estilos.etiqueta}>GESTÃO DE ALUNOS</Text>
                        <Text style={estilos.titulo}>Alunos</Text>
                        <Text style={estilos.descricao}>Encontre um cadastro ou receba um novo aluno.</Text>
                        <BotaoLink
                            titulo="+ Novo aluno"
                            destino="/alunos/novo"
                        />
                        <Campo
                            rotulo="Buscar por nome ou matrícula"
                            value={busca}
                            onChangeText={definirBusca}
                            placeholder="Ex.: Ana ou A000001"
                            maxLength={100}
                            returnKeyType="search"
                            onSubmitEditing={pesquisar}
                        />
                        <Botao
                            titulo="Buscar"
                            secundario
                            aoPressionar={pesquisar}
                            desabilitado={carregando}
                        />
                        {!carregando && !erro && <Text style={estilos.descricao}>{total} cadastro(s) encontrado(s)</Text>}
                    </View>
                }
                ListFooterComponent={apresentarRodape()}
            />
        </SafeAreaView>
    );
}

function identificarAluno(aluno) {
    // Uso o UUID para que o React reconheça cada cadastro entre atualizações.
    return aluno.id;
}
