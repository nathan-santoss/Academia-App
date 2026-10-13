// Exibo um link com aparência de botão para navegar entre as telas do aplicativo.
import { Link } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { estilos } from '../theme/tema';

export default function BotaoLink({ titulo, destino }) {
    // Uso Link para navegar e deixo o Pressable fornecer a área de toque do botão.
    return (
        <Link
            href={destino}
            asChild
        >
            <Pressable
                style={estilos.botao}
                accessibilityRole="link"
            >
                <Text style={estilos.botaoTexto}>{titulo}</Text>
            </Pressable>
        </Link>
    );
}
