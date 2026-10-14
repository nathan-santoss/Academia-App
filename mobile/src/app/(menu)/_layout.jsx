// Monto o menu inferior com as áreas de perfil, lembretes e informações do app.
// Recebo o acesso já liberado pelo layout principal. Divido a navegação em Meu perfil, Lembretes e Sobre; cada
// arquivo dessa pasta aponta para a tela correspondente, enquanto os formulários abrem no Stack.

import { Tabs } from 'expo-router/js-tabs';
import { cores } from '../../theme/tema';

// Organizo as três abas do rodapé e seus estilos; os formulários continuam no Stack do layout principal.
export default function MenuInferior() {
    // Agrupo as três áreas no rodapé; formulários e detalhes continuam no Stack.
    return (
        // Mantenho estas telas no menu inferior para trocar de aba.
        <Tabs screenOptions={{
            // Reúno os estilos do cabeçalho das telas desta navegação.
            headerStyle: {
                // Escolho a cor de fundo deste bloco usando a paleta compartilhada quando ela aparece aqui.
                backgroundColor: cores.fundo,
            }, // Concluo os campos de headerStyle e volto ao objeto que reúne essa configuração.
            // Escolho a cor do título e dos controles do cabeçalho.
            headerTintColor: cores.texto,
            // Defino se o cabeçalho mostra uma sombra na separação da tela.
            headerShadowVisible: false,
            // Destaco a aba selecionada com esta cor.
            tabBarActiveTintColor: cores.destaque,
            // Deixo as abas não selecionadas com esta cor.
            tabBarInactiveTintColor: cores.secundario,
            // Agrupo os campos de tabBarIconStyle para manter essa parte do objeto organizada.
            tabBarIconStyle: {
                // Controlo a exibição deste elemento; none retira o componente do layout.
                display: 'none',
            }, // Concluo os campos de tabBarIconStyle e volto ao objeto que reúne essa configuração.
            // Defino a aparência do texto de cada aba.
            tabBarLabelStyle: {
                // Defino o tamanho da letra para diferenciar este texto dos demais.
                fontSize: 14,
                // Escolho o peso da letra; números maiores deixam o texto mais forte.
                fontWeight: '600',
            }, // Concluo os campos de tabBarLabelStyle e volto ao objeto que reúne essa configuração.
            // Agrupo os campos de tabBarItemStyle para manter essa parte do objeto organizada.
            tabBarItemStyle: {
                // Afasto o conteúdo das bordas superior e inferior.
                paddingVertical: 10,
            }, // Concluo os campos de tabBarItemStyle e volto ao objeto que reúne essa configuração.
            // Reúno a aparência da barra fixa que troca as abas.
            tabBarStyle: {
                // Escolho a cor de fundo deste bloco usando a paleta compartilhada quando ela aparece aqui.
                backgroundColor: cores.superficie,
                // Defino a cor da borda superior que separa o menu do conteúdo.
                borderTopColor: cores.borda,
            }, // Concluo os campos de tabBarStyle e volto ao objeto que reúne essa configuração.
            // Agrupo os campos de sceneStyle para manter essa parte do objeto organizada.
            sceneStyle: {
                // Escolho a cor de fundo deste bloco usando a paleta compartilhada quando ela aparece aqui.
                backgroundColor: cores.fundo,
            }, // Concluo os campos de sceneStyle e volto ao objeto que reúne essa configuração.
        }} // Concluo este objeto com os campos que a etapa atual precisa.
        // Concluo os atributos de Tabs e começo seu conteúdo filho.
        >
            {/* Configuro o nome e a aparência desta aba no menu inferior. */}
            <Tabs.Screen
                // Relaciono esta tela ao arquivo ou grupo o texto "index" que o Expo Router reconhece como rota.
                name="index"
                // Agrupo as opções desta tela, como título e exibição do cabeçalho.
                options={{
                    // Escolho o título apresentado nesta tela, aba ou notificação.
                    title: 'Treinos',
                }} // Concluo este objeto com os campos que a etapa atual precisa.
            // Concluo os atributos de Tabs.Screen; este elemento não recebe conteúdo filho.
            />
            {/* Configuro o nome e a aparência desta aba no menu inferior. */}
            <Tabs.Screen
                // Relaciono esta tela ao arquivo ou grupo o texto "lembretes" que o Expo Router reconhece como rota.
                name="lembretes"
                // Agrupo as opções desta tela, como título e exibição do cabeçalho.
                options={{
                    // Escolho o título apresentado nesta tela, aba ou notificação.
                    title: 'Lembretes',
                    href: null,
                }} // Concluo este objeto com os campos que a etapa atual precisa.
            // Concluo os atributos de Tabs.Screen; este elemento não recebe conteúdo filho.
            />
            {/* Configuro o nome e a aparência desta aba no menu inferior. */}

            {/* Encerro o conteúdo de Tabs; os próximos elementos ficam fora deste bloco. */}
            <Tabs.Screen
                name="evolucao"
                options={{
                    title: 'Histórico',
                }}
            />
            <Tabs.Screen
                name="conta"
                options={{
                    title: 'Minha conta',
                }}
            />
            <Tabs.Screen
                // Relaciono esta tela ao arquivo ou grupo o texto "preferencias" que o Expo Router reconhece como
                // rota.
                name="preferencias"
                // Agrupo as opções desta tela, como título e exibição do cabeçalho.
                options={{
                    // Escolho o título apresentado nesta tela, aba ou notificação.
                    title: 'Sobre',
                }} // Concluo este objeto com os campos que a etapa atual precisa.
            // Concluo os atributos de Tabs.Screen; este elemento não recebe conteúdo filho.
            />
        </Tabs>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino MenuInferior e devolvo o controle a quem chamou.
