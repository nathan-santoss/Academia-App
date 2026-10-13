// Apresento um dado com seu rótulo e identifico os valores que não foram informados.
import { Text, View } from 'react-native';
import { estilos } from '../theme/tema';

export default function Informacao({ rotulo, valor }) {
    let texto = 'Não informado';

    // Apresento a ausência de um dado opcional sem inventar um valor.
    if (valor) {
        texto = valor;
    }

    return (
        <View style={estilos.grupo}>
            <Text style={estilos.descricao}>{rotulo}</Text>
            <Text
                selectable
                style={estilos.texto}
            >{texto}</Text>
        </View>
    );
}
