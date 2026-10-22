import { Text, TextInput, View } from 'react-native';
import { cores } from '../../theme/tema';
import { visualRotina as visual } from '../../theme/rotina';

export default function CampoRotina({ rotulo, valor, aoAlterar, limite = 100, numerico = false, multilinha = false, exemplo = '', aoEnviar = undefined }) {
    /** @type {import('react-native').KeyboardTypeOptions} */
    let teclado = 'default';
    if (numerico) { teclado = 'decimal-pad'; }
    let texto = '';
    if (valor !== null && valor !== undefined) { texto = String(valor); }
    return (
        <View style={visual.grupo}>
            <Text style={visual.detalhe}>{rotulo}</Text>
            <TextInput
                style={visual.campo}
                accessibilityLabel={rotulo}
                value={texto}
                onChangeText={aoAlterar}
                keyboardType={teclado}
                maxLength={limite}
                multiline={multilinha}
                placeholder={exemplo}
                placeholderTextColor={cores.secundario}
                selectionColor={cores.destaque}
                onSubmitEditing={aoEnviar}
            />
        </View>
    );
}
