// Reúno rótulo e entrada de texto para manter os formulários consistentes.
import { Text, TextInput, View } from 'react-native';
import { cores, estilos } from '../theme/tema';

export default function Campo(propriedades) {
    // Mantenho o rótulo visível mesmo depois que a pessoa começa a digitar.
    return (
        <View style={estilos.grupo}>
            <Text style={estilos.texto}>{propriedades.rotulo}</Text>
            <TextInput
                style={estilos.campo}
                placeholderTextColor={cores.secundario}
                selectionColor={cores.destaque}
                accessibilityLabel={propriedades.rotulo}
                value={propriedades.value}
                onChangeText={propriedades.onChangeText}
                editable={propriedades.editable}
                maxLength={propriedades.maxLength}
                placeholder={propriedades.placeholder}
                keyboardType={propriedades.keyboardType}
                autoCapitalize={propriedades.autoCapitalize}
                autoCorrect={propriedades.autoCorrect}
                onSubmitEditing={propriedades.onSubmitEditing}
                returnKeyType={propriedades.returnKeyType}
            />
        </View>
    );
}
