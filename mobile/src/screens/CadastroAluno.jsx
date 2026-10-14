// Crio uma conta de aluno com dados pessoais e senha, confirmando somente após a resposta da API.
// Leio o formulário, confiro o preenchimento no celular e envio a conta ao serviço de acesso. A API repete as
// validações importantes e cria a matrícula; só mostro a conclusão depois da resposta, e então ofereço voltar ao
// login.

import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import Botao from '../components/Botao';
import Campo from '../components/Campo';
import Aviso from '../components/Aviso';
import { criarConta } from '../services/acesso-servico';
import { criarFormularioVazio, prepararCadastro, validarFormulario } from '../utils/validar-cadastro-aluno';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { vibrarAoConcluir } from '../utils/vibracao';
import { preencherData } from '../utils/formatar-data';
import { senhaNovaValida } from '../utils/validar-senha';
import { estilos } from '../theme/tema';

// Monto a criação da conta e só ofereço entrar depois da confirmação da API.
export default function CadastroAluno() {
    // Retiro vibracaoAtiva de o resultado de usePreferencias para usar esses campos diretamente neste trecho.
    const { vibracaoAtiva } = usePreferencias();
    // Preparo alturaCabecalho com esta chamada. Leio a altura real do cabeçalho para posicionar o formulário quando o
    // teclado abre.
    const alturaCabecalho = useHeaderHeight();
    // Reúno os campos editáveis num único estado. Uso definirFormulario para mudar esse estado e pedir ao React que
    // atualize a tela.
    const [formulario, definirFormulario] = useState(criarFormularioVazio);
    // Sinalizo que há uma gravação em andamento. Uso definirSalvando para mudar esse estado e pedir ao React que
    // atualize a tela.
    const [salvando, definirSalvando] = useState(false);
    // Reservo a mensagem de falha que será mostrada à pessoa. Uso definirErro para mudar esse estado e pedir ao React
    // que atualize a tela.
    const [erro, definirErro] = useState('');
    // Registro a confirmação do cadastro para não enviar outra cópia. Uso definirContaCriada para mudar esse estado e
    // pedir ao React que atualize a tela.
    const [contaCriada, definirContaCriada] = useState(false);
    // Mantenho a senha apenas no estado deste formulário. Uso definirSenha para mudar esse estado e pedir ao React
    // que atualize a tela.
    const [senha, definirSenha] = useState('');
    // Guardo a segunda digitação da senha para compará-la antes do envio. Uso definirConfirmacao para mudar esse
    // estado e pedir ao React que atualize a tela.
    const [confirmacao, definirConfirmacao] = useState('');
    // Mantenho envioEmAndamento numa referência; leio e altero current sem esperar uma nova renderização.
    const envioEmAndamento = useRef(false);
    // Mantenho telaAberta numa referência; leio e altero current sem esperar uma nova renderização.
    const telaAberta = useRef(true);
    // Mantenho rolagem numa referência; leio e altero current sem esperar uma nova renderização.
    const rolagem = useRef(null);

    // Deixo de atualizar a tela se a pessoa sair durante a solicitação.
    useEffect(function acompanharTela() {
        // Atualizo telaAberta.current com true.
        telaAberta.current = true;

        // Devolvo a função de limpeza para o React chamá-la quando este efeito for encerrado.
        return function fecharTela() {
            // Atualizo telaAberta.current com false.
            telaAberta.current = false;
        }; // Termino fecharTela e devolvo o controle a quem chamou.
    }, []); // Registro este efeito sem valores variáveis na lista de dependências.

    // Atualizo apenas o campo escolhido e mantenho o restante do formulário; na data, também preparo a máscara.
    function alterarCampo(campo, valor) {
        // Acrescento as barras da data para permitir digitação apenas com números.
        if (campo === 'nascimento') {
            // Atualizo valor com o resultado de preencherData. Chamo preencherData em formatar-data.js. Nesse passo,
            // retiro caracteres extras e acrescento as barras enquanto a pessoa digita os números da data.
            valor = preencherData(valor);
        } // Encerro a conferência de campo.

        // Atualizo apenas o campo digitado e preservo os demais valores.
        definirFormulario(Object.assign({}, formulario, {
            // Uso colchetes para escolher o nome da propriedade pelo conteúdo de campo e atualizar somente essa
            // entrada do formulário.
            [campo]: valor,
        })); // Concluo este objeto com os campos que a etapa atual precisa.
    } // Termino alterarCampo e devolvo o controle a quem chamou.

    // Guardo a mensagem e, quando há referência à rolagem, levo o aviso para a parte visível do formulário.
    function mostrarErro(mensagem) {
        // Levo o aviso ao início da tela sem apagar o que já foi preenchido.
        definirErro(mensagem);

        // Confirmo que a referência já aponta para a área de rolagem antes de chamar scrollTo.
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
        // Bloqueio toques repetidos imediatamente, antes da próxima renderização.
        if (envioEmAndamento.current || contaCriada) {
            // Termino esta chamada aqui para não executar os próximos passos deste caminho.
            return;
        } // Encerro a conferência de envioEmAndamento.current.

        // Preparo mensagem com esta chamada. Chamo validarFormulario em validar-cadastro-aluno.js. Nesse passo,
        // confiro o preenchimento básico no celular; deixo a API conferir novamente CPF, idade e demais regras.
        const mensagem = validarFormulario(formulario);

        // Interrompo o caminho de sucesso quando a validação devolveu uma mensagem.
        if (mensagem) {
            // Guardo a mensagem e, quando há referência à rolagem, levo o aviso para a parte visível do formulário.
            mostrarErro(mensagem);
            // Termino esta chamada aqui para não executar os próximos passos deste caminho.
            return;
        } // Encerro a conferência de mensagem.

        // Confiro a confirmação sem mandar a segunda cópia da senha para a API.
        if (!senhaNovaValida(senha)) {
            // Guardo a mensagem e, quando há referência à rolagem, levo o aviso para a parte visível do formulário.
            mostrarErro('Use pelo menos 8 caracteres e até 72 bytes UTF-8. Acentos e emojis ocupam mais de um byte.');
            // Termino esta chamada aqui para não executar os próximos passos deste caminho.
            return;
        } // Encerro a conferência de esta condição.
        // Confiro se senha é diferente de confirmacao antes de executar o bloco abaixo.
        if (senha !== confirmacao) {
            // Guardo a mensagem e, quando há referência à rolagem, levo o aviso para a parte visível do formulário.
            mostrarErro('As senhas não coincidem. Confira os dois campos.');
            // Termino esta chamada aqui para não executar os próximos passos deste caminho.
            return;
        } // Encerro a conferência de senha.

        // Atualizo envioEmAndamento.current com true.
        envioEmAndamento.current = true;
        // Atualizo salvando no estado; o React usa o novo valor na próxima renderização.
        definirSalvando(true);
        // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
        definirErro('');

        // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
        // await.
        try {
            // Preparo dados com esta chamada. Uso Object.assign para copiar os campos para um objeto; com {} no
            // começo, preservo o objeto original.
            const dados = Object.assign({}, prepararCadastro(formulario), {
                // Passo a senha somente para o fluxo de acesso; o backend calcula sua proteção antes de gravá-la.
                senha: senha,
            }); // Concluo este objeto com os campos que a etapa atual precisa.
            // Espero esta tarefa terminar antes de continuar. Chamo criarConta em acesso-servico.js. Nesse passo,
            // envio o formulário ao cadastro público e devolvo a confirmação da API à tela.
            await criarConta(dados);

            // Confirmo o cadastro somente depois que a API devolve o aluno salvo.
            if (telaAberta.current) {
                // Atualizo contaCriada no estado; o React usa o novo valor na próxima renderização.
                definirContaCriada(true);
                // Atualizo senha no estado; o React usa o novo valor na próxima renderização.
                definirSenha('');
                // Atualizo confirmacao no estado; o React usa o novo valor na próxima renderização.
                definirConfirmacao('');
                // Respeito a preferência compartilhada depois da confirmação do backend.
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

    // Troco o formulário concluído pela entrada para que voltar não repita a criação da conta.
    function irParaLogin() {
        // Troco o formulário pela entrada para não repetir a criação ao voltar.
        router.replace('/entrar');
    } // Termino irParaLogin e devolvo o controle a quem chamou.

    // Confirmo a conta sem abrir uma sessão antes da conferência da senha.
    if (contaCriada) {
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
                    {/* Apresento "CADASTRO CONCLUÍDO" com Text para explicar esta parte da tela. */}
                    <Text style={estilos.etiqueta}>CADASTRO CONCLUÍDO</Text>
                    {/* Apresento "Tudo pronto!" com Text para explicar esta parte da tela. */}
                    <Text style={estilos.titulo}>Tudo pronto!</Text>
                    {/* Agrupo estes elementos num bloco para aplicar seu layout em conjunto. */}
                    <View style={estilos.cartao}>
                        {/* Exibo formulario.nome dentro do Text; as chaves levam o valor JavaScript para a tela. */}
                        <Text style={estilos.subtitulo}>{formulario.nome}</Text>
                        {/* Apresento "Sua conta foi criada. Entre com seu e-mail e sua senha para continuar." com
                            Text para explicar esta parte da tela. */}
                        <Text style={estilos.descricao}>Sua conta foi criada. Entre com seu e-mail e sua senha para continuar.</Text>
                        {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
                    </View>
                    {/* Monto Botao para apresentar o texto "Entrar na minha conta" e reaproveitar o comportamento
                        desse componente. */}
                    <Botao
                        // Uso o texto "Entrar na minha conta" como texto desta ação para indicar o que acontece no
                        // toque.
                        titulo="Entrar na minha conta"
                        // Escolho a aparência de ação secundária sem mudar a função executada pelo botão.
                        secundario
                        // Ligo o toque a irParaLogin; passo a função sem executá-la agora para ela rodar só quando a
                        // pessoa tocar.
                        aoPressionar={irParaLogin}
                    // Concluo os atributos de Botao; este elemento não recebe conteúdo filho.
                    />
                    {/* Encerro o conteúdo de ScrollView; os próximos elementos ficam fora deste bloco. */}
                </ScrollView>
                {/* Encerro o conteúdo de SafeAreaView; os próximos elementos ficam fora deste bloco. */}
            </SafeAreaView>
        ); // Concluo a interface devolvida por esta função para o React montar.
    } // Encerro a conferência de contaCriada.

    // Inicio textoBotao com o texto "Criar minha conta"; vou ajustar esse valor conforme as condições abaixo.
    let textoBotao = 'Criar minha conta';

    // Mudo a apresentação da ação enquanto o envio do formulário está em andamento.
    if (salvando) {
        // Atualizo textoBotao com o texto "Salvando cadastro…".
        textoBotao = 'Salvando cadastro…';
    } // Encerro a conferência de salvando.

    // Monto um Campo ligado ao valor e à atualização do formulário para reaproveitar essa ligação em várias entradas.
    function campo(rotulo, nome, propriedades = {}) {
        // Reaproveito a ligação entre campo e formulário sem repetir essa lógica no JSX.
        return (
            // Monto Campo para apresentar rotulo e reaproveitar o comportamento desse componente.
            <Campo
                // Identifico este campo com rotulo para a pessoa saber o que preencher ou ler.
                rotulo={rotulo}
                // Mostro formulario[nome] no Campo; quando a pessoa altera o campo, onChangeText ou onValueChange
                // avisa quem guarda o estado.
                value={formulario[nome]}
                // Entrego o texto digitado a para atualizar este campo no estado e mostrar seu novo valor.
                onChangeText={function atualizarValor(valor) {
                    // Atualizo apenas o campo escolhido e mantenho o restante do formulário; na data, também preparo
                    // a máscara.
                    alterarCampo(nome, valor);
                }} // Termino atualizarValor e devolvo o controle a quem chamou.
                // Controlo se a entrada aceita edição para não mudar o pedido enquanto ele está sendo enviado.
                editable={!salvando}
                // Defino quando o teclado pode colocar maiúsculas automaticamente; em e-mail e senha preservo o que
                // foi digitado.
                autoCapitalize={propriedades.autoCapitalize}
                // Controlo a correção automática do teclado para evitar que ela altere dados como e-mail e senha.
                autoCorrect={propriedades.autoCorrect}
                // Peço o teclado adequado ao dado, como números ou e-mail, para facilitar a digitação.
                keyboardType={propriedades.keyboardType}
                // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o celular não é a
                // única forma de enviar dados.
                maxLength={propriedades.maxLength}
                // Mostro um exemplo enquanto o campo está vazio; esse texto não vira um valor cadastrado.
                placeholder={propriedades.placeholder}
            // Concluo os atributos de Campo; este elemento não recebe conteúdo filho.
            />
        ); // Concluo a interface devolvida por esta função para o React montar.
    } // Termino campo e devolvo o controle a quem chamou.

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
            {/* Compenso o teclado no iOS; no Android uso o redimensionamento da janela. */}
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
                    {/* Apresento "UM NOVO COMEÇO" com Text para explicar esta parte da tela. */}
                    <Text style={estilos.etiqueta}>UM NOVO COMEÇO</Text>
                    {/* Apresento "Crie sua conta" com Text para explicar esta parte da tela. */}
                    <Text style={estilos.titulo}>Crie sua conta</Text>
                    {/* Apresento "Preencha os dados abaixo. O cadastro é destinado a pessoas com 18 anos
                        completos." com Text para explicar esta parte da tela. */}
                    <Text style={estilos.descricao}>Preencha os dados abaixo. O cadastro é destinado a pessoas com 18 anos completos.</Text>
                    {/* Monto Aviso para apresentar erro e reaproveitar o comportamento desse componente. */}
                    <Aviso
                        // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não ocupa
                        // espaço.
                        mensagem={erro}
                        // Uso a apresentação de erro para diferenciar esta orientação de uma mensagem comum.
                        erro
                    // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                    />
                    {/* Agrupo estes elementos num bloco para aplicar seu layout em conjunto. */}
                    <View style={estilos.grupo}>
                        {/* Apresento "01 · Dados pessoais" com Text para explicar esta parte da tela. */}
                        <Text style={estilos.subtitulo}>01 · Dados pessoais</Text>
                        {/* Coloco o resultado desta expressão JavaScript dentro do conteúdo visual. */}
                        {campo('Nome completo *', 'nome', {
                            // Defino quando o teclado pode colocar maiúsculas automaticamente; em e-mail e senha
                            // preservo o que foi digitado.
                            autoCapitalize: 'words',
                            // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o
                            // celular não é a única forma de enviar dados.
                            maxLength: 150,
                        // Concluo este objeto com os campos que a etapa atual precisa.
                        })}
                        {/* Coloco o resultado desta expressão JavaScript dentro do conteúdo visual. */}
                        {campo('CPF *', 'cpf', {
                            // Peço o teclado adequado ao dado, como números ou e-mail, para facilitar a digitação.
                            keyboardType: 'numeric',
                            // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o
                            // celular não é a única forma de enviar dados.
                            maxLength: 14,
                            // Mostro um exemplo enquanto o campo está vazio; esse texto não vira um valor cadastrado.
                            placeholder: '000.000.000-00',
                        // Concluo este objeto com os campos que a etapa atual precisa.
                        })}
                        {/* Coloco o resultado desta expressão JavaScript dentro do conteúdo visual. */}
                        {campo('Data de nascimento *', 'nascimento', {
                            // Peço o teclado adequado ao dado, como números ou e-mail, para facilitar a digitação.
                            keyboardType: 'number-pad',
                            // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o
                            // celular não é a única forma de enviar dados.
                            maxLength: 10,
                            // Mostro um exemplo enquanto o campo está vazio; esse texto não vira um valor cadastrado.
                            placeholder: 'DD/MM/AAAA',
                        // Concluo este objeto com os campos que a etapa atual precisa.
                        })}
                        {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
                    </View>
                    {/* Agrupo estes elementos num bloco para aplicar seu layout em conjunto. */}
                    <View style={estilos.grupo}>
                        {/* Apresento "02 · Contato" com Text para explicar esta parte da tela. */}
                        <Text style={estilos.subtitulo}>02 · Contato</Text>
                        {/* Coloco o resultado desta expressão JavaScript dentro do conteúdo visual. */}
                        {campo('E-mail *', 'email', {
                            // Peço o teclado adequado ao dado, como números ou e-mail, para facilitar a digitação.
                            keyboardType: 'email-address',
                            // Defino quando o teclado pode colocar maiúsculas automaticamente; em e-mail e senha
                            // preservo o que foi digitado.
                            autoCapitalize: 'none',
                            // Controlo a correção automática do teclado para evitar que ela altere dados como e-mail
                            // e senha.
                            autoCorrect: false,
                            // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o
                            // celular não é a única forma de enviar dados.
                            maxLength: 254,
                        // Concluo este objeto com os campos que a etapa atual precisa.
                        })}
                        {/* Coloco o resultado desta expressão JavaScript dentro do conteúdo visual. */}
                        {campo('Telefone com DDD *', 'telefone', {
                            // Peço o teclado adequado ao dado, como números ou e-mail, para facilitar a digitação.
                            keyboardType: 'phone-pad',
                            // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o
                            // celular não é a única forma de enviar dados.
                            maxLength: 20,
                            // Mostro um exemplo enquanto o campo está vazio; esse texto não vira um valor cadastrado.
                            placeholder: '(11) 99999-9999',
                        // Concluo este objeto com os campos que a etapa atual precisa.
                        })}
                        {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
                    </View>
                    {/* Agrupo estes elementos num bloco para aplicar seu layout em conjunto. */}
                    <View style={estilos.grupo}>
                        {/* Apresento "03 · Acesso" com Text para explicar esta parte da tela. */}
                        <Text style={estilos.subtitulo}>03 · Acesso</Text>
                        {/* Apresento "Escolha uma senha de 15 a 128 caracteres. Use uma frase que consiga
                            lembrar." com Text para explicar esta parte da tela. */}
                        <Text style={estilos.descricao}>Use pelo menos 8 caracteres e até 72 bytes UTF-8. Acentos e emojis ocupam mais de um byte.</Text>
                        {/* Monto Campo para apresentar o texto "Senha *" e reaproveitar o comportamento desse
                            componente. */}
                        <Campo
                            // Identifico este campo com o texto "Senha *" para a pessoa saber o que preencher ou ler.
                            rotulo="Senha *"
                            // Mostro senha no Campo; quando a pessoa altera o campo, onChangeText ou onValueChange
                            // avisa quem guarda o estado.
                            value={senha}
                            // Entrego o texto digitado a definirSenha para atualizar este campo no estado e mostrar
                            // seu novo valor.
                            onChangeText={definirSenha}
                            // Escondo os caracteres da senha na tela; a proteção do armazenamento continua sendo
                            // responsabilidade do serviço de acesso.
                            secureTextEntry
                            // Defino quando o teclado pode colocar maiúsculas automaticamente; em e-mail e senha
                            // preservo o que foi digitado.
                            autoCapitalize="none"
                            // Controlo a correção automática do teclado para evitar que ela altere dados como e-mail
                            // e senha.
                            autoCorrect={false}
                            // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o
                            // celular não é a única forma de enviar dados.
                            maxLength={128}
                            // Controlo se a entrada aceita edição para não mudar o pedido enquanto ele está sendo
                            // enviado.
                            editable={!salvando}
                        // Concluo os atributos de Campo; este elemento não recebe conteúdo filho.
                        />
                        {/* Monto Campo para apresentar o texto "Repita a senha *" e reaproveitar o comportamento
                            desse componente. */}
                        <Campo
                            // Identifico este campo com o texto "Repita a senha *" para a pessoa saber o que
                            // preencher ou ler.
                            rotulo="Repita a senha *"
                            // Mostro confirmacao no Campo; quando a pessoa altera o campo, onChangeText ou
                            // onValueChange avisa quem guarda o estado.
                            value={confirmacao}
                            // Entrego o texto digitado a definirConfirmacao para atualizar este campo no estado e
                            // mostrar seu novo valor.
                            onChangeText={definirConfirmacao}
                            // Escondo os caracteres da senha na tela; a proteção do armazenamento continua sendo
                            // responsabilidade do serviço de acesso.
                            secureTextEntry
                            // Defino quando o teclado pode colocar maiúsculas automaticamente; em e-mail e senha
                            // preservo o que foi digitado.
                            autoCapitalize="none"
                            // Controlo a correção automática do teclado para evitar que ela altere dados como e-mail
                            // e senha.
                            autoCorrect={false}
                            // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o
                            // celular não é a única forma de enviar dados.
                            maxLength={128}
                            // Controlo se a entrada aceita edição para não mudar o pedido enquanto ele está sendo
                            // enviado.
                            editable={!salvando}
                        // Concluo os atributos de Campo; este elemento não recebe conteúdo filho.
                        />
                        {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
                    </View>
                    {/* Agrupo estes elementos num bloco para aplicar seu layout em conjunto. */}
                    <View style={estilos.grupo}>
                        {/* Apresento "04 · Informações opcionais" com Text para explicar esta parte da tela. */}
                        <Text style={estilos.subtitulo}>04 · Informações opcionais</Text>
                        {/* Apresento "Você pode deixar estes campos em branco." com Text para explicar esta parte
                            da tela. */}
                        <Text style={estilos.descricao}>Você pode deixar estes campos em branco.</Text>
                        {/* Coloco o resultado desta expressão JavaScript dentro do conteúdo visual. */}
                        {campo('Endereço da foto (HTTPS)', 'fotoUrl', {
                            // Peço o teclado adequado ao dado, como números ou e-mail, para facilitar a digitação.
                            keyboardType: 'url',
                            // Defino quando o teclado pode colocar maiúsculas automaticamente; em e-mail e senha
                            // preservo o que foi digitado.
                            autoCapitalize: 'none',
                            // Controlo a correção automática do teclado para evitar que ela altere dados como e-mail
                            // e senha.
                            autoCorrect: false,
                            // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o
                            // celular não é a única forma de enviar dados.
                            maxLength: 2048,
                            // Mostro um exemplo enquanto o campo está vazio; esse texto não vira um valor cadastrado.
                            placeholder: 'https://...',
                        // Concluo este objeto com os campos que a etapa atual precisa.
                        })}
                        {/* Coloco o resultado desta expressão JavaScript dentro do conteúdo visual. */}
                        {campo('Nome do contato de emergência', 'contatoNome', {
                            // Defino quando o teclado pode colocar maiúsculas automaticamente; em e-mail e senha
                            // preservo o que foi digitado.
                            autoCapitalize: 'words',
                            // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o
                            // celular não é a única forma de enviar dados.
                            maxLength: 150,
                        // Concluo este objeto com os campos que a etapa atual precisa.
                        })}
                        {/* Coloco o resultado desta expressão JavaScript dentro do conteúdo visual. */}
                        {campo('Telefone do contato de emergência', 'contatoTelefone', {
                            // Peço o teclado adequado ao dado, como números ou e-mail, para facilitar a digitação.
                            keyboardType: 'phone-pad',
                            // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o
                            // celular não é a única forma de enviar dados.
                            maxLength: 20,
                        // Concluo este objeto com os campos que a etapa atual precisa.
                        })}
                        {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
                    </View>
                    {/* Apresento "* Campos obrigatórios. A matrícula será gerada ao concluir o cadastro." com
                        Text para explicar esta parte da tela. */}
                    <Text style={estilos.descricao}>* Campos obrigatórios. A matrícula será gerada ao concluir o cadastro.</Text>
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
} // Termino CadastroAluno e devolvo o controle a quem chamou.
