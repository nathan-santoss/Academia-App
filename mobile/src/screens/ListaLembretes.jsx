// Consulto os lembretes online da conta conectada, mostro seus avisos e permito excluir uma anotação.
// Quando esta aba ganha foco, busco os lembretes da conta conectada. A FlatList monta cada cartão com
// apresentarLembrete; o botão de excluir pede confirmação e só depois chama remover e atualiza a consulta.

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

// Monto a lista da conta conectada e coordeno as consultas, a confirmação e a exclusão de cada item.
export default function ListaLembretes() {
    // Mantenho a lista recebida da API para montar os cartões. Uso definirLembretes para mudar esse estado e pedir ao
    // React que atualize a tela.
    const [lembretes, definirLembretes] = useState([]);
    // Controlo a espera enquanto os dados ainda não chegaram. Uso definirCarregando para mudar esse estado e pedir ao
    // React que atualize a tela.
    const [carregando, definirCarregando] = useState(true);
    // Bloqueio novas exclusões enquanto a atual ainda está em andamento. Uso definirExcluindo para mudar esse estado
    // e pedir ao React que atualize a tela.
    const [excluindo, definirExcluindo] = useState(false);
    // Reservo a mensagem de falha que será mostrada à pessoa. Uso definirErro para mudar esse estado e pedir ao React
    // que atualize a tela.
    const [erro, definirErro] = useState('');
    // Separo a orientação que pode aparecer junto dos dados. Uso definirAviso para mudar esse estado e pedir ao React
    // que atualize a tela.
    const [aviso, definirAviso] = useState('');
    // Mantenho exclusaoEmAndamento numa referência; leio e altero current sem esperar uma nova renderização.
    const exclusaoEmAndamento = useRef(false);
    // Mantenho telaAtiva numa referência; leio e altero current sem esperar uma nova renderização.
    const telaAtiva = useRef(false);
    // Mantenho numeroConsulta numa referência; leio e altero current sem esperar uma nova renderização.
    const numeroConsulta = useRef(0);

    // Identifico esta consulta, busco os lembretes e aceito o resultado somente se ela ainda for a consulta mais
    // recente. Mantenho a referência da função enquanto suas dependências não mudam, evitando repetir efeitos só por
    // uma nova renderização.
    const atualizarLista = useCallback(async function carregarLista() {
        // Identifico a consulta para uma resposta antiga não substituir a mais recente.
        numeroConsulta.current += 1;
        // Guardo consulta com numeroConsulta.current para reutilizar esse resultado neste trecho.
        const consulta = numeroConsulta.current;
        // Atualizo carregando no estado; o React usa o novo valor na próxima renderização.
        definirCarregando(true);
        // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
        definirErro('');
        // Atualizo aviso no estado; o React usa o novo valor na próxima renderização.
        definirAviso('');

        // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
        // await.
        try {
            // Espero o resultado antes de preencher resultado. Chamo listarLembretes em lembrete-servico.js. Nesse
            // passo, consulto os lembretes online e cruzo os IDs com os avisos deste aparelho para mostrar a situação
            // local.
            const resultado = await listarLembretes();

            // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
            if (telaAtiva.current && consulta === numeroConsulta.current) {
                // Atualizo lembretes no estado; o React usa o novo valor na próxima renderização.
                definirLembretes(resultado.dados);
                // Atualizo aviso no estado; o React usa o novo valor na próxima renderização.
                definirAviso(resultado.aviso);
            } // Encerro a conferência de telaAtiva.current.
        // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
        } catch (falha) {
            // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
            if (telaAtiva.current && consulta === numeroConsulta.current) {
                // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
                definirErro(falha.message);
            } // Encerro a conferência de telaAtiva.current.
        // Executo esta limpeza tanto no sucesso quanto na falha para não deixar controles presos.
        } finally {
            // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
            if (telaAtiva.current && consulta === numeroConsulta.current) {
                // Atualizo carregando no estado; o React usa o novo valor na próxima renderização.
                definirCarregando(false);
            } // Encerro a conferência de telaAtiva.current.
        } // Concluo a etapa de limpeza do finally.
    }, []); // Mantenho esta função sem dependências que variem entre renderizações.

    // Consulto novamente ao voltar do cadastro ou de outra aba.
    useFocusEffect(useCallback(function acompanharTela() {
        // Atualizo telaAtiva.current com true.
        telaAtiva.current = true;
        // Disparo a função de consulta para renovar os lembretes mostrados na tela.
        atualizarLista();

        // Devolvo a função de limpeza para o React chamá-la quando este efeito for encerrado.
        return function sairDaLista() {
            // Atualizo telaAtiva.current com false.
            telaAtiva.current = false;
            // Acrescento 1 em numeroConsulta.current e guardo o novo resultado nessa mesma variável.
            numeroConsulta.current += 1;
        }; // Termino sairDaLista e devolvo o controle a quem chamou.
    }, [atualizarLista])); // Concluo esta lista na ordem que a chamada espera.

    // Bloqueio exclusões simultâneas, espero apagar no serviço e então peço a atualização da lista.
    async function remover(id) {
        // Protejo a exclusão de toques repetidos enquanto o sistema cancela o aviso.
        if (exclusaoEmAndamento.current || !telaAtiva.current) {
            // Termino esta chamada aqui para não executar os próximos passos deste caminho.
            return;
        } // Encerro a conferência de exclusaoEmAndamento.current.

        // Atualizo exclusaoEmAndamento.current com true.
        exclusaoEmAndamento.current = true;
        // Atualizo excluindo no estado; o React usa o novo valor na próxima renderização.
        definirExcluindo(true);
        // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
        definirErro('');

        // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
        // await.
        try {
            // Espero o resultado antes de preencher mensagem. Chamo excluirLembrete em lembrete-servico.js. Nesse
            // passo, excluo o lembrete online antes de retirar o aviso local; informo se o sistema não conseguir
            // cancelar a notificação.
            const mensagem = await excluirLembrete(id);

            // Só atualizo a lista se a tela ainda estiver ativa quando esta tarefa terminar.
            if (telaAtiva.current) {
                // Disparo a função de consulta para renovar os lembretes mostrados na tela.
                atualizarLista();

                // Interrompo o caminho de sucesso quando a validação devolveu uma mensagem.
                if (mensagem) {
                    // Abro um aviso do sistema com a mensagem e os botões definidos aqui.
                    Alert.alert('Confira o aviso', mensagem);
                } // Encerro a conferência de mensagem.
            } // Encerro a conferência de telaAtiva.current.
        // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
        } catch {
            // Só atualizo a lista se a tela ainda estiver ativa quando esta tarefa terminar.
            if (telaAtiva.current) {
                // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
                definirErro('Não consegui concluir a exclusão. Atualize a lista antes de tentar novamente.');
            } // Encerro a conferência de telaAtiva.current.
        // Executo esta limpeza tanto no sucesso quanto na falha para não deixar controles presos.
        } finally {
            // Atualizo exclusaoEmAndamento.current com false.
            exclusaoEmAndamento.current = false;
            // Atualizo excluindo no estado; o React usa o novo valor na próxima renderização.
            definirExcluindo(false);
        } // Concluo a etapa de limpeza do finally.
    } // Termino remover e devolvo o controle a quem chamou.

    // Mostro o pedido de confirmação antes de apagar um lembrete que a pessoa escolheu.
    function confirmarExclusao(lembrete) {
        // Peço confirmação porque esta ação apaga o lembrete e cancela seu aviso.
        Alert.alert('Excluir lembrete?', lembrete.titulo, [
            // Coloco o resultado desta expressão JavaScript dentro do conteúdo visual.
            {
                // Escolho o texto deste botão no aviso do sistema para deixar sua ação clara.
                text: 'Manter',
                // Aplico os estilos indicados a este componente para reaproveitar a aparência definida em tema.js.
                style: 'cancel',
            }, // Concluo este objeto com os campos que a etapa atual precisa.
            // Coloco o resultado desta expressão JavaScript dentro do conteúdo visual.
            {
                // Escolho o texto deste botão no aviso do sistema para deixar sua ação clara.
                text: 'Excluir',
                // Aplico os estilos indicados a este componente para reaproveitar a aparência definida em tema.js.
                style: 'destructive',
                // Recebo a confirmação no alerta e chamo a exclusão do lembrete escolhido.
                onPress: function confirmar() {
                    // Bloqueio exclusões simultâneas, espero apagar no serviço e então peço a atualização da lista.
                    remover(lembrete.id);
                }, // Termino confirmar e devolvo o controle a quem chamou.
            }, // Concluo este objeto com os campos que a etapa atual precisa.
        ]); // Concluo esta lista na ordem que a chamada espera.
    } // Termino confirmarExclusao e devolvo o controle a quem chamou.

    // Recebo um item da FlatList e monto seu cartão com título, horário, situação do aviso e botão de excluir.
    function apresentarLembrete({ item }) {
        // Devolvo os componentes que o React deve montar para esta parte da tela.
        return (
            // Agrupo estes elementos num bloco para aplicar seu layout em conjunto.
            <View style={estilos.cartao}>
                {/* Exibo item.titulo dentro do Text; as chaves levam o valor JavaScript para a tela. */}
                <Text style={estilos.subtitulo}>{item.titulo}</Text>
                {/* Exibo o resultado de apresentarHorario dentro do Text; as chaves levam o valor JavaScript para
                    a tela. */}
                <Text style={estilos.texto}>{apresentarHorario(item.dataHora)}</Text>
                {/* Exibo item.situacao dentro do Text; as chaves levam o valor JavaScript para a tela. */}
                <Text style={estilos.descricao}>{item.situacao}</Text>
                {/* Monto Botao para apresentar o texto "Excluir" e reaproveitar o comportamento desse componente. */}
                <Botao
                    // Uso o texto "Excluir" como texto desta ação para indicar o que acontece no toque.
                    titulo="Excluir"
                    // Escolho a aparência de ação secundária sem mudar a função executada pelo botão.
                    secundario
                    // Passo ao Botao quando ele deve ignorar novos toques.
                    desabilitado={excluindo || carregando}
                    // Ligo o toque a ; passo a função sem executá-la agora para ela rodar só quando a pessoa tocar.
                    aoPressionar={function escolherLembrete() {
                        // Mostro o pedido de confirmação antes de apagar um lembrete que a pessoa escolheu.
                        confirmarExclusao(item);
                    }} // Termino escolherLembrete e devolvo o controle a quem chamou.
                // Concluo os atributos de Botao; este elemento não recebe conteúdo filho.
                />
                {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
            </View>
        ); // Concluo a interface devolvida por esta função para o React montar.
    } // Termino apresentarLembrete e devolvo o controle a quem chamou.

    // Mostro a orientação de lista vazia só depois da consulta e quando não há uma falha para explicar.
    function apresentarListaVazia() {
        // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
        if (carregando || erro) {
            // Devolvo null para indicar que não há um resultado a entregar neste caminho.
            return null;
        } // Encerro a conferência de carregando.

        // Aplico os estilos indicados a este componente para reaproveitar a aparência definida em tema.js.
        return <Text style={estilos.descricao}>Você ainda não tem lembretes. Crie o primeiro para organizar sua rotina.</Text>;
    } // Termino apresentarListaVazia e devolvo o controle a quem chamou.

    // Devolvo os componentes que o React deve montar para esta parte da tela.
    return (
        // Respeito as bordas reservadas pelo aparelho para os controles não ficarem sob recortes ou barras do
        // sistema.
        <SafeAreaView
            // Aplico estilos.tela ao SafeAreaView para aproveitar os estilos compartilhados.
            style={estilos.tela}
            // Escolho quais bordas respeitam a área segura para o conteúdo não ficar por baixo de recortes ou barras
            // do aparelho.
            edges={['left', 'right']}
        // Concluo os atributos de SafeAreaView e começo seu conteúdo filho.
        >
            {/* Reutilizo a lista nativa para apresentar os registros sem montar todas as linhas de uma vez. */}
            <FlatList
                // Entrego à FlatList os registros que devem aparecer na lista.
                data={lembretes}
                // Devolvo uma chave estável para a FlatList reconhecer o mesmo lembrete depois de uma atualização.
                keyExtractor={function identificarItem(item) {
                    // Devolvo o resultado desta chamada a quem pediu esta etapa. Converto o valor para texto para
                    // manter o formato esperado nesta saída.
                    return String(item.id);
                }} // Termino identificarItem e devolvo o controle a quem chamou.
                // Passo a função que monta o cartão de cada item; a FlatList decide quando chamá-la.
                renderItem={apresentarLembrete}
                // Aplico os espaços ao conteúdo rolável, que é diferente da área externa do ScrollView ou da lista.
                contentContainerStyle={estilos.conteudo}
                // Escolho o conteúdo usado quando a lista não tem registros para apresentar.
                ListEmptyComponent={apresentarListaVazia}
                // Monto o cabeçalho dentro da lista para título, botões e mensagens rolarem junto com os itens.
                ListHeaderComponent={
                    // Agrupo estes elementos num bloco para aplicar seu layout em conjunto.
                    <View style={estilos.grupo}>
                        {/* Apresento "SUA ROTINA" com Text para explicar esta parte da tela. */}
                        <Text style={estilos.etiqueta}>SUA ROTINA</Text>
                        {/* Apresento "Lembretes" com Text para explicar esta parte da tela. */}
                        <Text style={estilos.titulo}>Lembretes</Text>
                        {/* Apresento "Suas anotações ficam salvas online. Conecte-se à internet para consultar
                            esta lista." com Text para explicar esta parte da tela. */}
                        <Text style={estilos.descricao}>Suas anotações ficam salvas online. Conecte-se à internet para consultar esta lista.</Text>
                        {/* Monto BotaoLink para apresentar o texto "Novo lembrete" e reaproveitar o comportamento
                            desse componente. */}
                        <BotaoLink
                            // Uso o texto "Novo lembrete" como texto desta ação para indicar o que acontece no toque.
                            titulo="Novo lembrete"
                            // Aponto este botão para o texto "/lembretes/novo"; o Router abre a tela correspondente
                            // ao caminho.
                            destino="/lembretes/novo"
                        // Concluo os atributos de BotaoLink; este elemento não recebe conteúdo filho.
                        />
                        {/* Monto Aviso para apresentar aviso e reaproveitar o comportamento desse componente. */}
                        <Aviso mensagem={aviso} />
                        {/* Monto Aviso para apresentar erro e reaproveitar o comportamento desse componente. */}
                        <Aviso
                            // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não ocupa
                            // espaço.
                            mensagem={erro}
                            // Uso a apresentação de erro para diferenciar esta orientação de uma mensagem comum.
                            erro
                            // Passo a ação de nova tentativa; sem função, o Aviso fica apenas com a mensagem.
                            aoTentar={atualizarLista}
                        // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                        />
                        {/* Mostro este trecho somente quando a condição à esquerda de && permite; se ela for
                            falsa, não monto o conteúdo. */}
                        {carregando && (
                            // Monto Aviso para apresentar o texto "Carregando lembretes…" e reaproveitar o
                            // comportamento desse componente.
                            <Aviso
                                // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não
                                // ocupa espaço.
                                mensagem="Carregando lembretes…"
                                // Peço ao Aviso o indicador de atividade enquanto a operação ainda está em andamento.
                                carregando
                            // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                            />
                        // Concluo esta expressão JavaScript e volto à composição visual da tela.
                        )}
                        {/* Mostro este trecho somente quando a condição à esquerda de && permite; se ela for
                            falsa, não monto o conteúdo. */}
                        {excluindo && (
                            // Monto Aviso para apresentar o texto "Excluindo lembrete…" e reaproveitar o
                            // comportamento desse componente.
                            <Aviso
                                // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não
                                // ocupa espaço.
                                mensagem="Excluindo lembrete…"
                                // Peço ao Aviso o indicador de atividade enquanto a operação ainda está em andamento.
                                carregando
                            // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                            />
                        // Concluo esta expressão JavaScript e volto à composição visual da tela.
                        )}
                        {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
                    </View>
                } // Concluo esta expressão JavaScript e volto à composição visual da tela.
            // Concluo os atributos de FlatList; este elemento não recebe conteúdo filho.
            />
            {/* Encerro o conteúdo de SafeAreaView; os próximos elementos ficam fora deste bloco. */}
        </SafeAreaView>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino ListaLembretes e devolvo o controle a quem chamou.
