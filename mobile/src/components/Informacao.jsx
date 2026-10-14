// Apresento um dado com seu rótulo e identifico os valores que não foram informados.
// Recebo rótulo e valor das telas de perfil e Sobre. Mostro um texto padrão quando o valor não veio, mantendo essa
// decisão fora de cada tela que me utiliza.

import { Text, View } from 'react-native';
import { estilos } from '../theme/tema';

// Mostro um dado com seu rótulo e deixo a ausência de informação explícita quando o valor não veio.
export default function Informacao({ rotulo, valor }) {
    // Inicio texto com o texto "Não informado"; vou ajustar esse valor conforme as condições abaixo.
    let texto = 'Não informado';

    // Apresento a ausência de um dado opcional sem inventar um valor.
    if (valor) {
        // Atualizo texto com valor.
        texto = valor;
    } // Encerro a conferência de valor.

    // Devolvo os componentes que o React deve montar para esta parte da tela.
    return (
        // Agrupo estes elementos num bloco para aplicar seu layout em conjunto.
        <View style={estilos.grupo}>
            {/* Exibo rotulo dentro do Text; as chaves levam o valor JavaScript para a tela. */}
            <Text style={estilos.descricao}>{rotulo}</Text>
            {/* Exibo texto dentro do Text; as chaves levam o valor JavaScript para a tela. */}
            <Text
                // Permito selecionar e copiar este texto, o que ajuda ao consultar informações do cadastro.
                selectable
                // Aplico estilos.texto ao Text para aproveitar os estilos compartilhados.
                style={estilos.texto}
            // Mostro o texto preparado entre as tags de Text; as chaves inserem o valor da variável na tela.
            >{texto}</Text>
            {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
        </View>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino Informacao e devolvo o controle a quem chamou.
