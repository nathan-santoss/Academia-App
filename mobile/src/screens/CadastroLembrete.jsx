// Recebo título e horário do lembrete e ofereço o agendamento de um aviso local.
// Recebo título, data e hora, preparo um pedido identificável e chamo o serviço de lembretes. Depois da confirmação
// online, mostro o resultado do aviso e permito voltar à lista; preservo o mesmo ID numa tentativa com os mesmos
// dados.

import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { useHeaderHeight } from 'expo-router/react-navigation';
import Aviso from '../components/Aviso';
import Botao from '../components/Botao';
import Campo from '../components/Campo';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { cadastrarLembrete } from '../services/lembrete-servico';
import { prepararLembrete } from '../utils/validar-lembrete';
import { apresentarHorario, preencherData, preencherHora } from '../utils/formatar-data';
import { vibrarAoConcluir } from '../utils/vibracao';
import { cores, estilos } from '../theme/tema';

// Monto o formulário de lembrete e acompanho o envio e o resultado do agendamento local.
export default function CadastroLembrete() {
    // Retiro vibracaoAtiva de o resultado de usePreferencias para usar esses campos diretamente neste trecho.
    const { vibracaoAtiva } = usePreferencias();
    // Preparo alturaCabecalho com esta chamada. Leio a altura real do cabeçalho para posicionar o formulário quando o
    // teclado abre.
    const alturaCabecalho = useHeaderHeight();

    // Mantenho o título enquanto a pessoa preenche o lembrete. Uso definirTitulo para mudar esse estado e pedir ao
    // React que atualize a tela.
    const [titulo, definirTitulo] = useState('');
    // Acompanho a data digitada antes de convertê-la para o formato da API. Uso definirData para mudar esse estado e
    // pedir ao React que atualize a tela.
    const [data, definirData] = useState('');
    // Acompanho o horário que a pessoa quer usar no lembrete. Uso definirHora para mudar esse estado e pedir ao React
    // que atualize a tela.
    const [hora, definirHora] = useState('');
    // Registro se a pessoa quer um aviso do sistema para este lembrete. Uso definirAvisar para mudar esse estado e
    // pedir ao React que atualize a tela.
    const [avisar, definirAvisar] = useState(true);
    // Sinalizo que há uma gravação em andamento. Uso definirSalvando para mudar esse estado e pedir ao React que
    // atualize a tela.
    const [salvando, definirSalvando] = useState(false);
    // Reservo a mensagem de falha que será mostrada à pessoa. Uso definirErro para mudar esse estado e pedir ao React
    // que atualize a tela.
    const [erro, definirErro] = useState('');
    // Guardo a confirmação para trocar o formulário pela mensagem de conclusão. Uso definirResultado para mudar esse
    // estado e pedir ao React que atualize a tela.
    const [resultado, definirResultado] = useState(null);
    // Mantenho envioEmAndamento numa referência; leio e altero current sem esperar uma nova renderização.
    const envioEmAndamento = useRef(false);
    // Mantenho telaAberta numa referência; leio e altero current sem esperar uma nova renderização.
    const telaAberta = useRef(true);
    // Mantenho rolagem numa referência; leio e altero current sem esperar uma nova renderização.
    const rolagem = useRef(null);
    // Mantenho o código do envio enquanto os dados forem os mesmos, para não duplicar uma tentativa. Uso useRef para
    // guardar um controle entre renderizações; mudar current não redesenha a tela.
    const pedido = useRef(null);

    // Evito atualizar o formulário depois que a pessoa sair desta tela.
    useEffect(function acompanharTela() {
        // Atualizo telaAberta.current com true.
        telaAberta.current = true;

        // Devolvo a função de limpeza para o React chamá-la quando este efeito for encerrado.
        return function sairDaTela() {
            // Atualizo telaAberta.current com false.
            telaAberta.current = false;
        }; // Termino sairDaTela e devolvo o controle a quem chamou.
    }, []); // Registro este efeito sem valores variáveis na lista de dependências.

    // Guardo a mensagem e, quando há referência à rolagem, levo o aviso para a parte visível do formulário.
    function mostrarErro(mensagem) {
        // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
        definirErro(mensagem);

        // Levo a mensagem até a parte visível sem apagar os campos preenchidos.
        if (rolagem.current) {
            // Levo a rolagem ao ponto indicado para a pessoa conseguir ver a mensagem.
            rolagem.current.scrollTo({
                // Escolho a posição vertical para a rolagem alcançar o ponto necessário da tela.
                y: 0,
                // Peço uma rolagem animada para a pessoa acompanhar o deslocamento até o aviso.
                animated: true,
            }); // Concluo este objeto com os campos que a etapa atual precisa.
        } // Encerro a conferência de rolagem.current.
    } // Termino mostrarErro e devolvo o controle a quem chamou.

    // Confiro o preenchimento, bloqueio um segundo envio e espero o serviço antes de mostrar sucesso ou erro.
    async function salvar() {
        // Bloqueio um segundo envio para preservar um único registro por cadastro.
        if (envioEmAndamento.current || resultado) {
            // Termino esta chamada aqui para não executar os próximos passos deste caminho.
            return;
        } // Encerro a conferência de envioEmAndamento.current.

        // Preparo dados com esta chamada. Chamo prepararLembrete em validar-lembrete.js. Nesse passo, confiro título,
        // data real e horário futuro antes de converter a escolha local em um instante ISO.
        const dados = prepararLembrete(titulo, data, hora);

        // Trato a orientação da validação antes de tentar enviar o lembrete.
        if (dados.mensagem) {
            // Guardo a mensagem e, quando há referência à rolagem, levo o aviso para a parte visível do formulário.
            mostrarErro(dados.mensagem);
            // Termino esta chamada aqui para não executar os próximos passos deste caminho.
            return;
        } // Encerro a conferência de dados.mensagem.

        // Atualizo envioEmAndamento.current com true.
        envioEmAndamento.current = true;
        // Atualizo salvando no estado; o React usa o novo valor na próxima renderização.
        definirSalvando(true);
        // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
        definirErro('');

        // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
        // await.
        try {
            // Preparo conteudo com esta chamada. Transformo os dados em texto JSON para enviar, guardar ou comparar
            // seu conteúdo.
            const conteudo = JSON.stringify(dados);

            // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
            if (!pedido.current || pedido.current.conteudo !== conteudo) {
                // Atualizo pedido.current com um objeto com os campos abaixo. Gero um identificador aleatório no
                // formato UUID para distinguir este registro ou pedido.
                pedido.current = {
                    // Informo o identificador deste registro para conseguir encontrá-lo depois.
                    id: randomUUID(),
                    // Guardo a representação do pedido para saber se uma tentativa repetida traz os mesmos dados.
                    conteudo: conteudo,
                }; // Concluo este objeto com os campos que a etapa atual precisa.
            } // Encerro a conferência de esta condição.

            // Espero o resultado antes de preencher salvo. Chamo cadastrarLembrete em lembrete-servico.js. Nesse
            // passo, envio o lembrete à API com o ID do pedido e, após a confirmação, tento agendar o aviso neste
            // aparelho se a pessoa escolheu essa opção.
            const salvo = await cadastrarLembrete(dados, avisar, pedido.current.id);

            // Verifico se a pessoa continua neste formulário antes de alterar o que a tela mostra.
            if (telaAberta.current) {
                // Confirmo a gravação mesmo quando o sistema não autoriza o aviso.
                definirResultado(salvo);
                // Chamo vibrarAoConcluir em vibracao.js. Nesse passo, tento uma vibração apenas quando a preferência
                // permite, sem desfazer o cadastro se o aparelho não conseguir vibrar.
                vibrarAoConcluir(vibracaoAtiva);
            } // Encerro a conferência de telaAberta.current.
        // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
        } catch (falha) {
            // Verifico se a pessoa continua neste formulário antes de alterar o que a tela mostra.
            if (telaAberta.current) {
                // Guardo a mensagem e, quando há referência à rolagem, levo o aviso para a parte visível do
                // formulário.
                mostrarErro(falha.message);
            } // Encerro a conferência de telaAberta.current.
        // Executo esta limpeza tanto no sucesso quanto na falha para não deixar controles presos.
        } finally {
            // Atualizo envioEmAndamento.current com false.
            envioEmAndamento.current = false;

            // Verifico se a pessoa continua neste formulário antes de alterar o que a tela mostra.
            if (telaAberta.current) {
                // Atualizo salvando no estado; o React usa o novo valor na próxima renderização.
                definirSalvando(false);
            } // Encerro a conferência de telaAberta.current.
        } // Concluo a etapa de limpeza do finally.
    } // Termino salvar e devolvo o controle a quem chamou.

    // Fecho o formulário concluído e volto à lista de lembretes usando o histórico do Router.
    function voltarParaLista() {
        // Fecho o formulário concluído para evitar um novo envio ao voltar.
        router.dismissTo('/lembretes');
    } // Termino voltarParaLista e devolvo o controle a quem chamou.

    // Troco o formulário pela confirmação quando o cadastro já retornou um resultado.
    if (resultado) {
        // Devolvo os componentes que o React deve montar para esta parte da tela.
        return (
            // Respeito as bordas reservadas pelo aparelho para os controles não ficarem sob recortes ou barras do
            // sistema.
            <SafeAreaView
                // Aplico estilos.tela ao SafeAreaView para aproveitar os estilos compartilhados.
                style={estilos.tela}
                // Escolho quais bordas respeitam a área segura para o conteúdo não ficar por baixo de recortes ou
                // barras do aparelho.
                edges={['bottom', 'left', 'right']}
            // Concluo os atributos de SafeAreaView e começo seu conteúdo filho.
            >
                {/* Permito rolar o conteúdo quando os campos não cabem na altura disponível. */}
                <ScrollView contentContainerStyle={estilos.conteudo}>
                    {/* Apresento "LEMBRETE SALVO" com Text para explicar esta parte da tela. */}
                    <Text style={estilos.etiqueta}>LEMBRETE SALVO</Text>
                    {/* Exibo resultado.lembrete.titulo dentro do Text; as chaves levam o valor JavaScript para a
                        tela. */}
                    <Text style={estilos.titulo}>{resultado.lembrete.titulo}</Text>
                    {/* Agrupo estes elementos num bloco para aplicar seu layout em conjunto. */}
                    <View style={estilos.cartao}>
                        {/* Exibo o resultado de apresentarHorario dentro do Text; as chaves levam o valor
                            JavaScript para a tela. */}
                        <Text style={estilos.texto}>{apresentarHorario(resultado.lembrete.dataHora)}</Text>
                        {/* Exibo resultado.mensagem dentro do Text; as chaves levam o valor JavaScript para a
                            tela. */}
                        <Text style={estilos.descricao}>{resultado.mensagem}</Text>
                        {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
                    </View>
                    {/* Monto Botao para apresentar o texto "Voltar aos lembretes" e reaproveitar o comportamento
                        desse componente. */}
                    <Botao
                        // Uso o texto "Voltar aos lembretes" como texto desta ação para indicar o que acontece no
                        // toque.
                        titulo="Voltar aos lembretes"
                        // Ligo o toque a voltarParaLista; passo a função sem executá-la agora para ela rodar só
                        // quando a pessoa tocar.
                        aoPressionar={voltarParaLista}
                    // Concluo os atributos de Botao; este elemento não recebe conteúdo filho.
                    />
                    {/* Encerro o conteúdo de ScrollView; os próximos elementos ficam fora deste bloco. */}
                </ScrollView>
                {/* Encerro o conteúdo de SafeAreaView; os próximos elementos ficam fora deste bloco. */}
            </SafeAreaView>
        ); // Concluo a interface devolvida por esta função para o React montar.
    } // Encerro a conferência de resultado.

    // Inicio textoBotao com o texto "Salvar lembrete"; vou ajustar esse valor conforme as condições abaixo.
    let textoBotao = 'Salvar lembrete';

    // Mudo a apresentação da ação enquanto o envio do formulário está em andamento.
    if (salvando) {
        // Atualizo textoBotao com o texto "Salvando lembrete…".
        textoBotao = 'Salvando lembrete…';
    } // Encerro a conferência de salvando.

    // Devolvo os componentes que o React deve montar para esta parte da tela.
    return (
        // Respeito as bordas reservadas pelo aparelho para os controles não ficarem sob recortes ou barras do
        // sistema.
        <SafeAreaView
            // Aplico estilos.tela ao SafeAreaView para aproveitar os estilos compartilhados.
            style={estilos.tela}
            // Escolho quais bordas respeitam a área segura para o conteúdo não ficar por baixo de recortes ou barras
            // do aparelho.
            edges={['bottom', 'left', 'right']}
        // Concluo os atributos de SafeAreaView e começo seu conteúdo filho.
        >
            {/* Ajusto a posição do formulário quando o teclado do iOS aparece. */}
            <KeyboardAvoidingView
                // Aplico estilos.tela ao KeyboardAvoidingView para aproveitar os estilos compartilhados.
                style={estilos.tela}
                // Escolho como o espaço do teclado é compensado quando o KeyboardAvoidingView está ativo.
                behavior="padding"
                // Ativo a compensação do teclado apenas na condição indicada, respeitando o comportamento de cada
                // sistema.
                enabled={Platform.OS === 'ios'}
                // Considero a altura do cabeçalho para não deslocar o formulário como se a tela começasse no topo do
                // aparelho.
                keyboardVerticalOffset={alturaCabecalho}
            // Concluo os atributos de KeyboardAvoidingView e começo seu conteúdo filho.
            >
                {/* Permito rolar o conteúdo quando os campos não cabem na altura disponível. */}
                <ScrollView
                    // Guardo uma referência ao componente para chamar uma ação dele depois, como rolar até uma
                    // mensagem.
                    ref={rolagem}
                    // Aplico os espaços ao conteúdo rolável, que é diferente da área externa do ScrollView ou da
                    // lista.
                    contentContainerStyle={estilos.conteudo}
                    // Permito tocar em ações do formulário com o teclado aberto sem perder o primeiro toque.
                    keyboardShouldPersistTaps="handled"
                // Concluo os atributos de ScrollView e começo seu conteúdo filho.
                >
                    {/* Apresento "SUA ROTINA" com Text para explicar esta parte da tela. */}
                    <Text style={estilos.etiqueta}>SUA ROTINA</Text>
                    {/* Apresento "Novo lembrete" com Text para explicar esta parte da tela. */}
                    <Text style={estilos.titulo}>Novo lembrete</Text>
                    {/* Apresento "Salve sua anotação online. É preciso ter internet para salvar e consultar seus
                        lembretes." com Text para explicar esta parte da tela. */}
                    <Text style={estilos.descricao}>Salve sua anotação online. É preciso ter internet para salvar e consultar seus lembretes.</Text>
                    {/* Monto Aviso para apresentar erro e reaproveitar o comportamento desse componente. */}
                    <Aviso
                        // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não ocupa
                        // espaço.
                        mensagem={erro}
                        // Uso a apresentação de erro para diferenciar esta orientação de uma mensagem comum.
                        erro
                    // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                    />
                    {/* Monto Campo para apresentar o texto "Título *" e reaproveitar o comportamento desse
                        componente. */}
                    <Campo
                        // Identifico este campo com o texto "Título *" para a pessoa saber o que preencher ou ler.
                        rotulo="Título *"
                        // Mostro titulo no Campo; quando a pessoa altera o campo, onChangeText ou onValueChange avisa
                        // quem guarda o estado.
                        value={titulo}
                        // Entrego o texto digitado a definirTitulo para atualizar este campo no estado e mostrar seu
                        // novo valor.
                        onChangeText={definirTitulo}
                        // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o celular
                        // não é a única forma de enviar dados.
                        maxLength={100}
                        // Controlo se a entrada aceita edição para não mudar o pedido enquanto ele está sendo
                        // enviado.
                        editable={!salvando}
                        // Mostro um exemplo enquanto o campo está vazio; esse texto não vira um valor cadastrado.
                        placeholder="Ex.: levar a garrafa de água"
                    // Concluo os atributos de Campo; este elemento não recebe conteúdo filho.
                    />
                    {/* Monto Campo para apresentar o texto "Data *" e reaproveitar o comportamento desse
                        componente. */}
                    <Campo
                        // Identifico este campo com o texto "Data *" para a pessoa saber o que preencher ou ler.
                        rotulo="Data *"
                        // Mostro data no Campo; quando a pessoa altera o campo, onChangeText ou onValueChange avisa
                        // quem guarda o estado.
                        value={data}
                        // Entrego o texto digitado a para atualizar este campo no estado e mostrar seu novo valor.
                        onChangeText={function alterarData(valor) {
                            // Atualizo data no estado; o React usa o novo valor na próxima renderização.
                            definirData(preencherData(valor));
                        }} // Termino alterarData e devolvo o controle a quem chamou.
                        // Peço o teclado adequado ao dado, como números ou e-mail, para facilitar a digitação.
                        keyboardType="number-pad"
                        // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o celular
                        // não é a única forma de enviar dados.
                        maxLength={10}
                        // Controlo se a entrada aceita edição para não mudar o pedido enquanto ele está sendo
                        // enviado.
                        editable={!salvando}
                        // Mostro um exemplo enquanto o campo está vazio; esse texto não vira um valor cadastrado.
                        placeholder="DD/MM/AAAA"
                    // Concluo os atributos de Campo; este elemento não recebe conteúdo filho.
                    />
                    {/* Monto Campo para apresentar o texto "Horário *" e reaproveitar o comportamento desse
                        componente. */}
                    <Campo
                        // Identifico este campo com o texto "Horário *" para a pessoa saber o que preencher ou ler.
                        rotulo="Horário *"
                        // Mostro hora no Campo; quando a pessoa altera o campo, onChangeText ou onValueChange avisa
                        // quem guarda o estado.
                        value={hora}
                        // Entrego o texto digitado a para atualizar este campo no estado e mostrar seu novo valor.
                        onChangeText={function alterarHora(valor) {
                            // Atualizo hora no estado; o React usa o novo valor na próxima renderização.
                            definirHora(preencherHora(valor));
                        }} // Termino alterarHora e devolvo o controle a quem chamou.
                        // Peço o teclado adequado ao dado, como números ou e-mail, para facilitar a digitação.
                        keyboardType="number-pad"
                        // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o celular
                        // não é a única forma de enviar dados.
                        maxLength={5}
                        // Controlo se a entrada aceita edição para não mudar o pedido enquanto ele está sendo
                        // enviado.
                        editable={!salvando}
                        // Mostro um exemplo enquanto o campo está vazio; esse texto não vira um valor cadastrado.
                        placeholder="HH:MM"
                    // Concluo os atributos de Campo; este elemento não recebe conteúdo filho.
                    />
                    {/* Agrupo estes elementos num bloco para aplicar seu layout em conjunto. */}
                    <View style={estilos.cartao}>
                        {/* Agrupo estes elementos num bloco para aplicar seu layout em conjunto. */}
                        <View style={estilos.linha}>
                            {/* Apresento "Avisar neste aparelho" com Text para explicar esta parte da tela. */}
                            <Text style={[estilos.texto, estilos.expandir]}>Avisar neste aparelho</Text>
                            {/* Mostro o controle de ligar e desligar a preferência de vibração. */}
                            <Switch
                                // Forneço uma descrição para o leitor de tela identificar a função deste controle.
                                accessibilityLabel="Avisar neste aparelho"
                                // Mostro avisar no Switch; quando a pessoa altera o campo, onChangeText ou
                                // onValueChange avisa quem guarda o estado.
                                value={avisar}
                                // Ligo a mudança do interruptor à função que atualiza e salva a preferência ou a
                                // escolha do formulário.
                                onValueChange={definirAvisar}
                                // Bloqueio o toque conforme o estado recebido para evitar ações durante a espera.
                                disabled={salvando}
                                // Defino as cores do trilho do interruptor para distinguir a opção ligada da
                                // desligada.
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
                        <Text style={estilos.descricao}>Ao salvar, pediremos permissão se necessário. Sem permissão, a anotação continua disponível aqui. O aviso será silencioso.</Text>
                        {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
                    </View>
                    {/* Apresento a orientação escrita abaixo com Text para explicar esta parte da tela. */}
                    <Text style={estilos.descricao}>Use o horário local do aparelho. A entrega do aviso depende das permissões e dos ajustes do sistema.</Text>
                    {/* Monto Botao para apresentar textoBotao e reaproveitar o comportamento desse componente. */}
                    <Botao
                        // Uso textoBotao como texto desta ação para indicar o que acontece no toque.
                        titulo={textoBotao}
                        // Ligo o toque a salvar; passo a função sem executá-la agora para ela rodar só quando a
                        // pessoa tocar.
                        aoPressionar={salvar}
                        // Passo ao Botao quando ele deve ignorar novos toques.
                        desabilitado={salvando}
                    // Concluo os atributos de Botao; este elemento não recebe conteúdo filho.
                    />
                    {/* Encerro o conteúdo de ScrollView; os próximos elementos ficam fora deste bloco. */}
                </ScrollView>
                {/* Encerro o conteúdo de KeyboardAvoidingView; os próximos elementos ficam fora deste bloco. */}
            </KeyboardAvoidingView>
            {/* Encerro o conteúdo de SafeAreaView; os próximos elementos ficam fora deste bloco. */}
        </SafeAreaView>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino CadastroLembrete e devolvo o controle a quem chamou.
