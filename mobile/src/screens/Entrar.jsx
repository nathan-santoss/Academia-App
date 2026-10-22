// Apresento o login e o caminho para criar uma conta pessoal na academia.
// Começo pelos campos de e-mail e senha. O botão chama entrar, que pede ajuda ao contexto; quando o contexto recebe o
// perfil, o layout libera o menu. Se houver falha, mantenho a pessoa no formulário com uma mensagem.

import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAcesso } from '../contexts/AcessoContext';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import BotaoLink from '../components/BotaoLink';
import Aviso from '../components/Aviso';
import { estilos } from '../theme/tema';

// Monto o formulário de login e mantenho suas entradas, espera e mensagem de erro na memória desta tela.
export default function Entrar() {
    // Preparo acesso com esta chamada. Chamo useAcesso em AcessoContext.jsx. Nesse passo, disponibilizo o contexto de
    // acesso para que as telas leiam a mesma sessão e chamem entrar ou sair.
    const acesso = useAcesso();
    // Acompanho o e-mail digitado. Uso definirEmail para mudar esse estado e pedir ao React que atualize a tela.
    const [email, definirEmail] = useState('');
    // Mantenho a senha apenas no estado deste formulário. Uso definirSenha para mudar esse estado e pedir ao React
    // que atualize a tela.
    const [senha, definirSenha] = useState('');
    // Reservo a mensagem de falha que será mostrada à pessoa. Uso definirErro para mudar esse estado e pedir ao React
    // que atualize a tela.
    const [erro, definirErro] = useState('');
    // Indico que o login está esperando a resposta do servidor. Uso definirEnviando para mudar esse estado e pedir ao
    // React que atualize a tela.
    const [enviando, definirEnviando] = useState(false);
    // Mantenho envioEmAndamento numa referência; leio e altero current sem esperar uma nova renderização.
    const envioEmAndamento = useRef(false);

    // Recebo o toque de entrar, bloqueio o reenvio e peço ao contexto que confirme o acesso; se falhar, mostro a
    // mensagem.
    async function entrar() {
        // Evito dois logins ao mesmo tempo quando a pessoa toca rápido no botão.
        if (envioEmAndamento.current) {
            // Termino esta chamada aqui para não executar os próximos passos deste caminho.
            return;
        } // Encerro a conferência de envioEmAndamento.current.
        // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
        if (!email.trim() || !senha) {
            // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
            definirErro('Preencha seu e-mail e sua senha.');
            // Termino esta chamada aqui para não executar os próximos passos deste caminho.
            return;
        } // Encerro a conferência de esta condição.
        // Atualizo envioEmAndamento.current com true.
        envioEmAndamento.current = true;
        // Atualizo enviando no estado; o React usa o novo valor na próxima renderização.
        definirEnviando(true);
        // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
        definirErro('');
        // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
        // await.
        try {
            // Espero esta tarefa terminar antes de continuar. Recebo o toque de entrar, bloqueio o reenvio e peço ao
            // contexto que confirme o acesso; se falhar, mostro a mensagem.
            await acesso.entrar(email.trim(), senha);
            // Limpo a senha da memória da tela depois de entrar.
            definirSenha('');
        // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
        } catch (falha) {
            // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
            definirErro(falha.message);
        // Executo esta limpeza tanto no sucesso quanto na falha para não deixar controles presos.
        } finally {
            // Atualizo envioEmAndamento.current com false.
            envioEmAndamento.current = false;
            // Atualizo enviando no estado; o React usa o novo valor na próxima renderização.
            definirEnviando(false);
        } // Concluo a etapa de limpeza do finally.
    } // Termino entrar e devolvo o controle a quem chamou.

    // Inicio tituloBotao com o texto "Entrar"; vou ajustar esse valor conforme as condições abaixo.
    let tituloBotao = 'Entrar';
    // Mostro que o login está conectando para a pessoa entender a espera.
    if (enviando) {
        // Atualizo tituloBotao com o texto "Conectando…".
        tituloBotao = 'Conectando…';
    } // Encerro a conferência de enviando.

    // Devolvo os componentes que o React deve montar para esta parte da tela.
    return (
        // Respeito as bordas reservadas pelo aparelho para os controles não ficarem sob recortes ou barras do
        // sistema.
        <SafeAreaView style={estilos.tela}>
            {/* Ajusto o espaço do formulário quando o teclado aparece para manter os campos acessíveis. */}
            <KeyboardAvoidingView
                // Aplico estilos.tela ao KeyboardAvoidingView para aproveitar os estilos compartilhados.
                style={estilos.tela}
                // Escolho como o espaço do teclado é compensado quando o KeyboardAvoidingView está ativo.
                behavior="padding"
                // Ativo a compensação do teclado apenas na condição indicada, respeitando o comportamento de cada
                // sistema.
                enabled={Platform.OS === 'ios'}
            // Concluo os atributos de KeyboardAvoidingView e começo seu conteúdo filho.
            >
                {/* Permito rolar o conteúdo quando os campos não cabem na altura disponível. */}
                <ScrollView
                    // Aplico os espaços ao conteúdo rolável, que é diferente da área externa do ScrollView ou da
                    // lista.
                    contentContainerStyle={estilos.conteudo}
                    // Permito tocar em ações do formulário com o teclado aberto sem perder o primeiro toque.
                    keyboardShouldPersistTaps="handled"
                // Concluo os atributos de ScrollView e começo seu conteúdo filho.
                >
                    {/* Apresento "ACADEMIA APP" com Text para explicar esta parte da tela. */}
                    <Text style={estilos.etiqueta}>ACADEMIA APP</Text>
                    {/* Apresento "Seu espaço na academia" com Text para explicar esta parte da tela. */}
                    <Text style={estilos.titulo}>Seu espaço na academia</Text>
                    {/* Apresento "Entre para organizar sua rotina e acompanhar seus treinos." com Text para
                        explicar esta parte da tela. */}
                    <Text style={estilos.descricao}>Entre para organizar sua rotina e acompanhar seus treinos.</Text>
                    {/* Monto Aviso para apresentar acesso.aviso e reaproveitar o comportamento desse componente. */}
                    <Aviso mensagem={acesso.aviso} />
                    {/* Monto Aviso para apresentar erro e reaproveitar o comportamento desse componente. */}
                    <Aviso
                        // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não ocupa
                        // espaço.
                        mensagem={erro}
                        // Uso a apresentação de erro para diferenciar esta orientação de uma mensagem comum.
                        erro
                    // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                    />
                    {/* Monto Campo para apresentar o texto "E-mail" e reaproveitar o comportamento desse
                        componente. */}
                    <Campo
                        // Identifico este campo com o texto "E-mail" para a pessoa saber o que preencher ou ler.
                        rotulo="E-mail"
                        // Mostro email no Campo; quando a pessoa altera o campo, onChangeText ou onValueChange avisa
                        // quem guarda o estado.
                        value={email}
                        // Entrego o texto digitado a definirEmail para atualizar este campo no estado e mostrar seu
                        // novo valor.
                        onChangeText={definirEmail}
                        // Peço o teclado adequado ao dado, como números ou e-mail, para facilitar a digitação.
                        keyboardType="email-address"
                        // Defino quando o teclado pode colocar maiúsculas automaticamente; em e-mail e senha preservo
                        // o que foi digitado.
                        autoCapitalize="none"
                        // Controlo a correção automática do teclado para evitar que ela altere dados como e-mail e
                        // senha.
                        autoCorrect={false}
                        // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o celular
                        // não é a única forma de enviar dados.
                        maxLength={254}
                        // Controlo se a entrada aceita edição para não mudar o pedido enquanto ele está sendo
                        // enviado.
                        editable={!enviando}
                    // Concluo os atributos de Campo; este elemento não recebe conteúdo filho.
                    />
                    {/* Monto Campo para apresentar o texto "Senha" e reaproveitar o comportamento desse
                        componente. */}
                    <Campo
                        // Identifico este campo com o texto "Senha" para a pessoa saber o que preencher ou ler.
                        rotulo="Senha"
                        // Mostro senha no Campo; quando a pessoa altera o campo, onChangeText ou onValueChange avisa
                        // quem guarda o estado.
                        value={senha}
                        // Entrego o texto digitado a definirSenha para atualizar este campo no estado e mostrar seu
                        // novo valor.
                        onChangeText={definirSenha}
                        // Escondo os caracteres da senha na tela; a proteção do armazenamento continua sendo
                        // responsabilidade do serviço de acesso.
                        secureTextEntry
                        // Defino quando o teclado pode colocar maiúsculas automaticamente; em e-mail e senha preservo
                        // o que foi digitado.
                        autoCapitalize="none"
                        // Controlo a correção automática do teclado para evitar que ela altere dados como e-mail e
                        // senha.
                        autoCorrect={false}
                        // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o celular
                        // não é a única forma de enviar dados.
                        maxLength={128}
                        // Controlo se a entrada aceita edição para não mudar o pedido enquanto ele está sendo
                        // enviado.
                        editable={!enviando}
                        // Ligo a ação do teclado à função indicada para permitir enviar sem procurar o botão na tela.
                        onSubmitEditing={entrar}
                        // Escolho o texto ou símbolo da tecla de ação para indicar o próximo passo no teclado.
                        returnKeyType="go"
                    // Concluo os atributos de Campo; este elemento não recebe conteúdo filho.
                    />
                    {/* Monto Botao para apresentar tituloBotao e reaproveitar o comportamento desse componente. */}
                    <Botao
                        // Uso tituloBotao como texto desta ação para indicar o que acontece no toque.
                        titulo={tituloBotao}
                        // Ligo o toque a entrar; passo a função sem executá-la agora para ela rodar só quando a
                        // pessoa tocar.
                        aoPressionar={entrar}
                        // Passo ao Botao quando ele deve ignorar novos toques.
                        desabilitado={enviando}
                    // Concluo os atributos de Botao; este elemento não recebe conteúdo filho.
                    />
                    {/* Mostro este trecho somente quando a condição à esquerda de && permite; se ela for falsa,
                        não monto o conteúdo. */}
                    {!enviando && (
                        // Monto BotaoLink para apresentar o texto "Criar minha conta" e reaproveitar o comportamento
                        // desse componente.
                        <BotaoLink
                            // Uso o texto "Criar minha conta" como texto desta ação para indicar o que acontece no
                            // toque.
                            titulo="Criar minha conta"
                            // Aponto este botão para o texto "/cadastro"; o Router abre a tela correspondente ao
                            // caminho.
                            destino="/cadastro"
                        // Concluo os atributos de BotaoLink; este elemento não recebe conteúdo filho.
                        />
                    // Concluo esta expressão JavaScript e volto à composição visual da tela.
                    )}
                    {/* Apresento a orientação escrita abaixo com Text para explicar esta parte da tela. */}
                    <BotaoLink
                        titulo="Esqueci minha senha"
                        destino="/recuperar"
                    />
                    <Text style={estilos.descricao}>Use uma conexão com a internet. O primeiro acesso pode levar até um minuto enquanto o servidor inicia.</Text>
                    {/* Encerro o conteúdo de ScrollView; os próximos elementos ficam fora deste bloco. */}
                </ScrollView>
                {/* Encerro o conteúdo de KeyboardAvoidingView; os próximos elementos ficam fora deste bloco. */}
            </KeyboardAvoidingView>
            {/* Encerro o conteúdo de SafeAreaView; os próximos elementos ficam fora deste bloco. */}
        </SafeAreaView>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino Entrar e devolvo o controle a quem chamou.
