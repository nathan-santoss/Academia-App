import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { estilos } from '../theme/tema';

export default function TelaFormulario({ children, rolavel = true }) {
    /** @type {'height' | 'padding'} */
    let comportamento = 'height';
    if (Platform.OS === 'ios') {
        comportamento = 'padding';
    }
    // Preservo o rodapé fixo quando a tela já organiza sua própria lista rolável.
    let conteudo = children;
    if (rolavel) {
        conteudo = (
            <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={estilos.conteudo}
            >
                {children}
            </ScrollView>
        );
    }
    return (
        <SafeAreaView
            style={estilos.tela}
            edges={['bottom', 'left', 'right']}
        >
            <KeyboardAvoidingView
                style={estilos.tela}
                behavior={comportamento}
                keyboardVerticalOffset={96}
            >
                {conteudo}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
