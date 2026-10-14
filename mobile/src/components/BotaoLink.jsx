// Exibo um link com aparência de botão para navegar entre as telas do aplicativo.
// Recebo as propriedades da tela e monto esta parte da interface. Devolvo os eventos para as funções recebidas para
// manter a ação no lugar que possui os dados. Sou usado por Entrar.jsx, ListaLembretes.jsx.

import { Link } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { estilos } from '../theme/tema';

// Monto um link com aparência de botão para o Router cuidar da troca de tela.
export default function BotaoLink({ titulo, destino }) {
    // Uso Link para navegar e deixo o Pressable fornecer a área de toque do botão.
    return (
        // Uso Link para abrir o destino pela navegação, mantendo o botão que aparece dentro dele.
        <Link
            // Passo ao Link o destino que o Router deve resolver dentro da navegação.
            href={destino}
            // Faço o Link usar o elemento filho como área de toque, mantendo a aparência do Pressable.
            asChild
        // Concluo os atributos de Link e começo seu conteúdo filho.
        >
            {/* Recebo os toques e uso o estado de pressão para dar retorno visual ao botão. */}
            <Pressable
                // Aplico estilos.botao ao Pressable para aproveitar os estilos compartilhados.
                style={estilos.botao}
                // Informo ao leitor de tela se este controle funciona como botão ou link.
                accessibilityRole="link"
            // Concluo os atributos de Pressable e começo seu conteúdo filho.
            >
                {/* Exibo titulo dentro do Text; as chaves levam o valor JavaScript para a tela. */}
                <Text style={estilos.botaoTexto}>{titulo}</Text>
                {/* Encerro o conteúdo de Pressable; os próximos elementos ficam fora deste bloco. */}
            </Pressable>
            {/* Encerro o conteúdo de Link; os próximos elementos ficam fora deste bloco. */}
        </Link>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino BotaoLink e devolvo o controle a quem chamou.
