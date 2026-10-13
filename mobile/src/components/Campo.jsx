// Reúno rótulo e entrada de texto para manter os formulários consistentes.
import { Text, TextInput, View } from 'react-native';
import { cores, estilos } from '../theme/tema';

export default function Campo({ rotulo, ...propriedades }) {
    // Mantenho o rótulo visível mesmo depois que a pessoa começa a digitar.
    return (
        <View style={estilos.grupo}>
            <Text style={estilos.texto}>{rotulo}</Text>
            <TextInput
                style={estilos.campo}
                placeholderTextColor={cores.secundario}
                selectionColor={cores.destaque}
                accessibilityLabel={rotulo}
                {...propriedades}
            />
        </View>
    );
}
