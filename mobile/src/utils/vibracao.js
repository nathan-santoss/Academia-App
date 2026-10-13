// Aciono a vibração de confirmação quando a preferência do usuário permite.
import { Vibration } from 'react-native';

export function vibrarAoConcluir(ativada) {
    if (!ativada) {
        return;
    }

    // Aciono uma vibração simples; a duração pode variar entre Android e iOS.
    try {
        Vibration.vibrate();
    } catch {
        // Preservo a operação concluída mesmo se o aparelho não oferecer vibração.
    }
}
