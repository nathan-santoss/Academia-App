// Organizo as telas públicas e pessoais, conferindo a sessão antes de mostrar o menu.
// Começo a organização das telas aqui: abro os contextos, confiro a sessão salva e escolho quais rotas podem
// aparecer. Uso Stack para permitir abrir formulários e voltar; o menu inferior fica no layout de (menu).

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { cores, estilos } from '../theme/tema';
import { PreferenciasProvider } from '../contexts/PreferenciasContext';
import { AcessoProvider, useAcesso } from '../contexts/AcessoContext';
import { configurarNotificacoes } from '../services/notificacao-servico';
import Aviso from '../components/Aviso';
import { EdicaoExercicioProvider } from '../contexts/EdicaoExercicioContext';

// Preparo os avisos locais sem pedir permissão durante a abertura do aplicativo.
configurarNotificacoes();

// Leio o estado do acesso e escolho entre a espera inicial e a navegação com suas rotas protegidas.
function Telas() {
    // Preparo acesso com esta chamada. Chamo useAcesso em AcessoContext.jsx. Nesse passo, disponibilizo o contexto de
    // acesso para que as telas leiam a mesma sessão e chamem entrar ou sair.
    const acesso = useAcesso();
    // Aguardo a consulta inicial para não piscar dados privados ou uma tela de login desnecessária.
    if (acesso.carregando || acesso.erroInicial) {
        // Inicio mensagem com o texto "Conectando à sua conta…"; vou ajustar esse valor conforme as condições abaixo.
        let mensagem = 'Conectando à sua conta…';
        // Inicio tentar com null, marcando a ausência de valor; vou ajustar esse valor conforme as condições abaixo.
        let tentar = null;
        // Exibo a falha de conexão inicial e disponibilizo a ação de restaurar a consulta.
        if (acesso.erroInicial) {
            // Atualizo mensagem com acesso.erroInicial.
            mensagem = acesso.erroInicial;
            // Atualizo tentar com acesso.restaurar.
            tentar = acesso.restaurar;
        } // Encerro a conferência de acesso.erroInicial.
        // Devolvo os componentes que o React deve montar para esta parte da tela.
        return (
            // Agrupo estes elementos num bloco para aplicar seu layout em conjunto.
            <View style={[estilos.tela, estilos.conteudo]}>
                {/* Monto Aviso para apresentar mensagem e reaproveitar o comportamento desse componente. */}
                <Aviso
                    // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não ocupa espaço.
                    mensagem={mensagem}
                    // Peço ao Aviso o indicador de atividade enquanto a operação ainda está em andamento.
                    carregando={acesso.carregando}
                    // Uso a apresentação de erro para diferenciar esta orientação de uma mensagem comum.
                    erro={Boolean(acesso.erroInicial)}
                    // Passo a ação de nova tentativa; sem função, o Aviso fica apenas com a mensagem.
                    aoTentar={tentar}
                // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                />
                {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
            </View>
        ); // Concluo a interface devolvida por esta função para o React montar.
    } // Encerro a conferência de acesso.carregando.

    // Devolvo os componentes que o React deve montar para esta parte da tela.
    return (
        // Crio a navegação em pilha para abrir telas e permitir voltar às anteriores.
        <Stack screenOptions={{
            // Reúno os estilos do cabeçalho das telas desta navegação.
            headerStyle: {
                // Escolho a cor de fundo deste bloco usando a paleta compartilhada quando ela aparece aqui.
                backgroundColor: cores.fundo,
            }, // Concluo os campos de headerStyle e volto ao objeto que reúne essa configuração.
            // Escolho a cor do título e dos controles do cabeçalho.
            headerTintColor: cores.texto,
            // Defino se o cabeçalho mostra uma sombra na separação da tela.
            headerShadowVisible: false,
            // Ajusto o fundo usado pela área de conteúdo das telas.
            contentStyle: {
                // Escolho a cor de fundo deste bloco usando a paleta compartilhada quando ela aparece aqui.
                backgroundColor: cores.fundo,
            }, // Concluo os campos de contentStyle e volto ao objeto que reúne essa configuração.
        }} // Concluo este objeto com os campos que a etapa atual precisa.
        // Concluo os atributos de Stack e começo seu conteúdo filho.
        >
            {/* Retiro também o histórico privado quando a pessoa sai da conta. */}
            <Stack.Protected guard={Boolean(acesso.usuario)}>
                <Stack.Screen
                    // Relaciono esta tela ao arquivo ou grupo o texto "(menu)" que o Expo Router reconhece como rota.
                    name="(menu)"
                    // Agrupo as opções desta tela, como título e exibição do cabeçalho.
                    options={{
                        // Escolho se esta rota mostra o cabeçalho do navegador.
                        headerShown: false,
                    }} // Concluo este objeto com os campos que a etapa atual precisa.
                // Concluo os atributos de Stack.Screen; este elemento não recebe conteúdo filho.
                />
                <Stack.Screen
                    name="treinos/rotina"
                    options={{
                        title: 'Rotina pessoal',
                    }}
                />
                <Stack.Screen
                    name="treinos/exercicio"
                    options={{
                        headerShown: false,
                        gestureEnabled: false,
                    }}
                />
                <Stack.Screen
                    name="treinos/executar"
                    options={{
                        title: 'Executar treino',
                    }}
                />
                <Stack.Screen
                    name="equipe"
                    options={{
                        title: 'Área da equipe',
                    }}
                />
                {/* Configuro esta rota pelo nome do arquivo para ela participar do Stack. */}
                {/* Configuro esta rota pelo nome do arquivo para ela participar do Stack. */}
                <Stack.Screen
                    // Relaciono esta tela ao arquivo ou grupo o texto "lembretes/novo" que o Expo Router reconhece
                    // como rota.
                    name="lembretes/novo"
                    // Agrupo as opções desta tela, como título e exibição do cabeçalho.
                    options={{
                        // Escolho o título apresentado nesta tela, aba ou notificação.
                        title: 'Novo lembrete',
                    }} // Concluo este objeto com os campos que a etapa atual precisa.
                // Concluo os atributos de Stack.Screen; este elemento não recebe conteúdo filho.
                />
                {/* Encerro o conteúdo de Stack.Protected; os próximos elementos ficam fora deste bloco. */}
            </Stack.Protected>
            {/* Limito estas rotas pela condição de acesso; o navegador também retira as rotas que deixam de ser
                permitidas. */}
            <Stack.Protected guard={!acesso.usuario}>
                {/* Configuro esta rota pelo nome do arquivo para ela participar do Stack. */}
                <Stack.Screen
                    // Relaciono esta tela ao arquivo ou grupo o texto "entrar" que o Expo Router reconhece como rota.
                    name="entrar"
                    // Agrupo as opções desta tela, como título e exibição do cabeçalho.
                    options={{
                        // Escolho se esta rota mostra o cabeçalho do navegador.
                        headerShown: false,
                    }} // Concluo este objeto com os campos que a etapa atual precisa.
                // Concluo os atributos de Stack.Screen; este elemento não recebe conteúdo filho.
                />
                {/* Configuro esta rota pelo nome do arquivo para ela participar do Stack. */}
                <Stack.Screen
                    // Relaciono esta tela ao arquivo ou grupo o texto "cadastro" que o Expo Router reconhece como
                    // rota.
                    name="cadastro"
                    // Agrupo as opções desta tela, como título e exibição do cabeçalho.
                    options={{
                        // Escolho o título apresentado nesta tela, aba ou notificação.
                        title: 'Criar minha conta',
                    }} // Concluo este objeto com os campos que a etapa atual precisa.
                // Concluo os atributos de Stack.Screen; este elemento não recebe conteúdo filho.
                />
                {/* Encerro o conteúdo de Stack.Protected; os próximos elementos ficam fora deste bloco. */}
            </Stack.Protected>
            {/* Encerro o conteúdo de Stack; os próximos elementos ficam fora deste bloco. */}
        </Stack>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino Telas e devolvo o controle a quem chamou.

// Monto os contextos por fora das telas para compartilhar acesso e preferências durante a navegação.
export default function Navegacao() {
    // Compartilho preferências e acesso sem repetir essa preparação em cada tela.
    return (
        // Reaproveito PreferenciasProvider aqui. Compartilho a escolha de vibração e o estado de sua leitura e
        // gravação com as telas do app.
        <PreferenciasProvider>
            {/* Reaproveito AcessoProvider aqui. Compartilho a sessão com as telas filhas para não precisar passar
                o mesmo acesso de componente em componente. */}
            <AcessoProvider>
                {/* Ajusto a aparência da barra de status do sistema para combinar com o fundo do aplicativo. */}
                <StatusBar style="light" />
                {/* Reaproveito Telas aqui. Leio o estado do acesso e escolho entre a espera inicial e a navegação
                    com suas rotas protegidas. */}
                <EdicaoExercicioProvider>
                    <Telas />
                </EdicaoExercicioProvider>
                {/* Encerro o conteúdo de AcessoProvider; os próximos elementos ficam fora deste bloco. */}
            </AcessoProvider>
            {/* Encerro o conteúdo de PreferenciasProvider; os próximos elementos ficam fora deste bloco. */}
        </PreferenciasProvider>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino Navegacao e devolvo o controle a quem chamou.
