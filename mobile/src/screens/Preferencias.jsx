// Disponibilizo o ajuste de vibração e apresento informações básicas do dispositivo.
// Junto três caminhos nesta tela: altero a vibração pelo contexto de preferências, leio informações pelo serviço do
// dispositivo e saio da conta pelo contexto de acesso. Cada caminho mantém sua própria mensagem de falha.

import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { consultarDispositivo } from '../services/dispositivo-servico';
import Aviso from '../components/Aviso';
import Informacao from '../components/Informacao';
import { cores, estilos } from '../theme/tema';
import { useAcesso } from '../contexts/AcessoContext';
import Botao from '../components/Botao';

// Apresento a preferência de vibração, as informações do aparelho e a opção de sair da conta.
export default function Preferencias() {
    // Preparo preferencias com esta chamada. Chamo usePreferencias em PreferenciasContext.jsx. Nesse passo,
    // disponibilizo o contexto de preferências; uso o prefixo use porque esta função é um hook do React.
    const preferencias = usePreferencias();
    // Preparo acesso com esta chamada. Chamo useAcesso em AcessoContext.jsx. Nesse passo, disponibilizo o contexto de
    // acesso para que as telas leiam a mesma sessão e chamem entrar ou sair.
    const acesso = useAcesso();
    // Sinalizo que a saída da conta ainda está sendo confirmada. Uso definirSaindo para mudar esse estado e pedir ao
    // React que atualize a tela.
    const [saindo, definirSaindo] = useState(false);
    // Separo a falha de logout das outras mensagens desta tela. Uso definirErroSaida para mudar esse estado e pedir
    // ao React que atualize a tela.
    const [erroSaida, definirErroSaida] = useState('');
    // Recebo as informações do aparelho que serão apresentadas na aba Sobre. Uso definirDispositivo para mudar esse
    // estado e pedir ao React que atualize a tela.
    const [dispositivo, definirDispositivo] = useState(null);
    // Guardo a falha da consulta do aparelho sem impedir o uso das preferências. Uso definirErroDispositivo para
    // mudar esse estado e pedir ao React que atualize a tela.
    const [erroDispositivo, definirErroDispositivo] = useState('');

    // Peço ao contexto que encerre a conta; mantenho uma mensagem de falha se não conseguir concluir.
    async function sair() {
        // Espero a confirmação da API para encerrar também a credencial no servidor.
        definirSaindo(true);
        // Atualizo erroSaida no estado; o React usa o novo valor na próxima renderização.
        definirErroSaida('');
        // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
        // await.
        try {
            // Espero esta tarefa terminar antes de continuar. Peço ao contexto que encerre a conta; mantenho uma
            // mensagem de falha se não conseguir concluir.
            await acesso.sair();
        // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
        } catch (falha) {
            // Atualizo erroSaida no estado; o React usa o novo valor na próxima renderização.
            definirErroSaida(falha.message);
        // Executo esta limpeza tanto no sucesso quanto na falha para não deixar controles presos.
        } finally {
            // Atualizo saindo no estado; o React usa o novo valor na próxima renderização.
            definirSaindo(false);
        } // Concluo a etapa de limpeza do finally.
    } // Termino sair e devolvo o controle a quem chamou.

    // Consulto as informações uma vez, sem enviá-las à API ou ao banco de alunos.
    useEffect(function carregarDispositivo() {
        // Inicio telaAtiva com true; vou ajustar esse valor conforme as condições abaixo.
        let telaAtiva = true;

        // Espero a leitura externa terminar antes de atualizar o estado, e confiro se o componente ainda está em uso.
        async function carregar() {
            // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas
            // com await.
            try {
                // Espero o resultado antes de preencher dados. Chamo consultarDispositivo em dispositivo-servico.js.
                // Nesse passo, leio informações fornecidas pelo sistema e traduzo o tipo de aparelho para a tela
                // Sobre.
                const dados = await consultarDispositivo();

                // Confiro se esta consulta ainda pertence à tela aberta antes de usar seu resultado.
                if (telaAtiva) {
                    // Atualizo dispositivo no estado; o React usa o novo valor na próxima renderização.
                    definirDispositivo(dados);
                } // Encerro a conferência de telaAtiva.
            // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
            } catch {
                // Confiro se esta consulta ainda pertence à tela aberta antes de usar seu resultado.
                if (telaAtiva) {
                    // Atualizo erroDispositivo no estado; o React usa o novo valor na próxima renderização.
                    definirErroDispositivo('Não foi possível consultar as informações deste aparelho.');
                } // Encerro a conferência de telaAtiva.
            } // Termino o tratamento desta falha e sigo para a limpeza, quando houver.
        } // Termino carregar e devolvo o controle a quem chamou.

        // Espero a leitura externa terminar antes de atualizar o estado, e confiro se o componente ainda está em uso.
        carregar();

        // Devolvo a função de limpeza para o React chamá-la quando este efeito for encerrado.
        return function sairDaTela() {
            // Atualizo telaAtiva com false.
            telaAtiva = false;
        }; // Termino sairDaTela e devolvo o controle a quem chamou.
    }, []); // Registro este efeito sem valores variáveis na lista de dependências.

    // Inicio mensagemPreferencia com texto vazio; vou ajustar esse valor conforme as condições abaixo.
    let mensagemPreferencia = '';

    // Mostro a espera enquanto a preferência ainda está sendo lida do aparelho.
    if (preferencias.carregando) {
        // Atualizo mensagemPreferencia com o texto "Recuperando sua preferência…".
        mensagemPreferencia = 'Recuperando sua preferência…';
    // Confiro se preferencias.salvando está disponível ou está verdadeiro antes de executar o bloco abaixo.
    } else if (preferencias.salvando) {
        // Atualizo mensagemPreferencia com o texto "Salvando sua escolha…".
        mensagemPreferencia = 'Salvando sua escolha…';
    } // Encerro a conferência de preferencias.salvando.

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
            {/* Permito rolar o conteúdo quando os campos não cabem na altura disponível. */}
            <ScrollView contentContainerStyle={estilos.conteudo}>
                {/* Apresento "DO SEU JEITO" com Text para explicar esta parte da tela. */}
                <Text style={estilos.etiqueta}>DO SEU JEITO</Text>
                {/* Apresento "Sobre o aplicativo" com Text para explicar esta parte da tela. */}
                <Text style={estilos.titulo}>Sobre o aplicativo</Text>
                {/* Apresento "Academia App · Rotinas, execu??o e hist?rico de treinos. Seus dados confirmados ficam na
                    academia." com Text para explicar esta parte da tela. */}
                <Text style={estilos.descricao}>Academia App · Rotinas, execu??o e hist?rico de treinos. Seus dados confirmados ficam na academia.</Text>
                {/* Monto Aviso para apresentar acesso.aviso e reaproveitar o comportamento desse componente. */}
                <Aviso mensagem={acesso.aviso} />
                {/* Monto Aviso para apresentar erroSaida e reaproveitar o comportamento desse componente. */}
                <Aviso
                    // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não ocupa espaço.
                    mensagem={erroSaida}
                    // Uso a apresentação de erro para diferenciar esta orientação de uma mensagem comum.
                    erro
                // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                />
                {/* Monto Botao para apresentar o texto "Sair da minha conta" e reaproveitar o comportamento desse
                    componente. */}
                <Botao
                    // Uso o texto "Sair da minha conta" como texto desta ação para indicar o que acontece no toque.
                    titulo="Sair da minha conta"
                    // Ligo o toque a sair; passo a função sem executá-la agora para ela rodar só quando a pessoa
                    // tocar.
                    aoPressionar={sair}
                    // Passo ao Botao quando ele deve ignorar novos toques.
                    desabilitado={saindo}
                    // Escolho a aparência de ação secundária sem mudar a função executada pelo botão.
                    secundario
                // Concluo os atributos de Botao; este elemento não recebe conteúdo filho.
                />
                {/* Mostro este trecho somente quando a condição à esquerda de && permite; se ela for falsa, não
                    monto o conteúdo. */}
                {saindo && (
                    // Monto Aviso para apresentar o texto "Encerrando acesso…" e reaproveitar o comportamento desse
                    // componente.
                    <Aviso
                        // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não ocupa
                        // espaço.
                        mensagem="Encerrando acesso…"
                        // Peço ao Aviso o indicador de atividade enquanto a operação ainda está em andamento.
                        carregando
                    // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                    />
                // Concluo esta expressão JavaScript e volto à composição visual da tela.
                )}
                {/* Agrupo estes elementos num bloco para aplicar seu layout em conjunto. */}
                <View style={estilos.cartao}>
                    {/* Agrupo estes elementos num bloco para aplicar seu layout em conjunto. */}
                    <View style={estilos.linha}>
                        {/* Apresento "Vibrar ao concluir cadastro" com Text para explicar esta parte da tela. */}
                        <Text style={[estilos.texto, estilos.expandir]}>Vibrar ao concluir cadastro</Text>
                        {/* Mostro o controle de ligar e desligar a preferência de vibração. */}
                        <Switch
                            // Forneço uma descrição para o leitor de tela identificar a função deste controle.
                            accessibilityLabel="Vibrar ao concluir cadastro"
                            // Mostro preferencias.vibracaoAtiva no Switch; quando a pessoa altera o campo,
                            // onChangeText ou onValueChange avisa quem guarda o estado.
                            value={preferencias.vibracaoAtiva}
                            // Ligo a mudança do interruptor à função que atualiza e salva a preferência ou a escolha
                            // do formulário.
                            onValueChange={preferencias.alterarVibracao}
                            // Bloqueio o toque conforme o estado recebido para evitar ações durante a espera.
                            disabled={preferencias.carregando || preferencias.salvando}
                            // Defino as cores do trilho do interruptor para distinguir a opção ligada da desligada.
                            trackColor={{
                                // Uso a cor da borda quando o interruptor estiver desligado.
                                false: cores.borda,
                                // Destaco o interruptor quando a opção estiver ligada.
                                true: cores.destaque,
                            }} // Concluo este objeto com os campos que a etapa atual precisa.
                        // Concluo os atributos de Switch; este elemento não recebe conteúdo filho.
                        />
                        {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
                    </View>
                    {/* Apresento a orientação escrita abaixo com Text para explicar esta parte da tela. */}
                    <Text style={estilos.descricao}>Receba uma confirmação pelo toque ao criar sua conta ou salvar um lembrete. Sua escolha fica guardada neste aparelho.</Text>
                    {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
                </View>
                {/* Monto Aviso para apresentar mensagemPreferencia e reaproveitar o comportamento desse
                    componente. */}
                <Aviso
                    // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não ocupa espaço.
                    mensagem={mensagemPreferencia}
                    // Peço ao Aviso o indicador de atividade enquanto a operação ainda está em andamento.
                    carregando
                // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                />
                {/* Monto Aviso para apresentar preferencias.erro e reaproveitar o comportamento desse componente. */}
                <Aviso
                    // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não ocupa espaço.
                    mensagem={preferencias.erro}
                    // Uso a apresentação de erro para diferenciar esta orientação de uma mensagem comum.
                    erro
                // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                />
                {/* Apresento "Sobre este aparelho" com Text para explicar esta parte da tela. */}
                <Text style={estilos.subtitulo}>Sobre este aparelho</Text>
                {/* Monto Aviso para apresentar erroDispositivo e reaproveitar o comportamento desse componente. */}
                <Aviso
                    // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não ocupa espaço.
                    mensagem={erroDispositivo}
                    // Uso a apresentação de erro para diferenciar esta orientação de uma mensagem comum.
                    erro
                // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                />
                {/* Mostro este trecho somente quando a condição à esquerda de && permite; se ela for falsa, não
                    monto o conteúdo. */}
                {!dispositivo && !erroDispositivo && (
                    // Monto Aviso para apresentar o texto "Consultando aparelho…" e reaproveitar o comportamento
                    // desse componente.
                    <Aviso
                        // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não ocupa
                        // espaço.
                        mensagem="Consultando aparelho…"
                        // Peço ao Aviso o indicador de atividade enquanto a operação ainda está em andamento.
                        carregando
                    // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                    />
                // Concluo esta expressão JavaScript e volto à composição visual da tela.
                )}
                {/* Mostro este trecho somente quando a condição à esquerda de && permite; se ela for falsa, não
                    monto o conteúdo. */}
                {dispositivo && (
                    // Agrupo estes elementos num bloco para aplicar seu layout em conjunto.
                    <View style={estilos.cartao}>
                        {/* Monto Informacao para apresentar o texto "Sistema operacional" e reaproveitar o
                            comportamento desse componente. */}
                        <Informacao
                            // Identifico este campo com o texto "Sistema operacional" para a pessoa saber o que
                            // preencher ou ler.
                            rotulo="Sistema operacional"
                            // Entrego dispositivo.sistema ao componente Informacao, que mostra o rótulo e trata a
                            // ausência de um dado.
                            valor={dispositivo.sistema}
                        // Concluo os atributos de Informacao; este elemento não recebe conteúdo filho.
                        />
                        {/* Monto Informacao para apresentar o texto "Versão do sistema" e reaproveitar o
                            comportamento desse componente. */}
                        <Informacao
                            // Identifico este campo com o texto "Versão do sistema" para a pessoa saber o que
                            // preencher ou ler.
                            rotulo="Versão do sistema"
                            // Entrego dispositivo.versao ao componente Informacao, que mostra o rótulo e trata a
                            // ausência de um dado.
                            valor={dispositivo.versao}
                        // Concluo os atributos de Informacao; este elemento não recebe conteúdo filho.
                        />
                        {/* Monto Informacao para apresentar o texto "Marca" e reaproveitar o comportamento desse
                            componente. */}
                        <Informacao
                            // Identifico este campo com o texto "Marca" para a pessoa saber o que preencher ou ler.
                            rotulo="Marca"
                            // Entrego dispositivo.marca ao componente Informacao, que mostra o rótulo e trata a
                            // ausência de um dado.
                            valor={dispositivo.marca}
                        // Concluo os atributos de Informacao; este elemento não recebe conteúdo filho.
                        />
                        {/* Monto Informacao para apresentar o texto "Modelo" e reaproveitar o comportamento desse
                            componente. */}
                        <Informacao
                            // Identifico este campo com o texto "Modelo" para a pessoa saber o que preencher ou ler.
                            rotulo="Modelo"
                            // Entrego dispositivo.modelo ao componente Informacao, que mostra o rótulo e trata a
                            // ausência de um dado.
                            valor={dispositivo.modelo}
                        // Concluo os atributos de Informacao; este elemento não recebe conteúdo filho.
                        />
                        {/* Monto Informacao para apresentar o texto "Tipo" e reaproveitar o comportamento desse
                            componente. */}
                        <Informacao
                            // Identifico este campo com o texto "Tipo" para a pessoa saber o que preencher ou ler.
                            rotulo="Tipo"
                            // Entrego dispositivo.tipo ao componente Informacao, que mostra o rótulo e trata a
                            // ausência de um dado.
                            valor={dispositivo.tipo}
                        // Concluo os atributos de Informacao; este elemento não recebe conteúdo filho.
                        />
                        {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
                    </View>
                // Concluo esta expressão JavaScript e volto à composição visual da tela.
                )}
                {/* Encerro o conteúdo de ScrollView; os próximos elementos ficam fora deste bloco. */}
            </ScrollView>
            {/* Encerro o conteúdo de SafeAreaView; os próximos elementos ficam fora deste bloco. */}
        </SafeAreaView>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino Preferencias e devolvo o controle a quem chamou.
