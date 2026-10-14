// Guardo a credencial de acesso no espaço protegido do celular, sem salvar a senha.
import * as SecureStore from 'expo-secure-store';

const chave = 'academia.sessao';

export function obterToken() {
    // Recupero a sessão ao reabrir o aplicativo; os dados pessoais continuam no Neon.
    return SecureStore.getItemAsync(chave);
}

export function guardarToken(token) {
    // Evito transferir a credencial para outro aparelho por backup do iOS.
    return SecureStore.setItemAsync(chave, token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
}

export function apagarToken() {
    // Removo o acesso salvo quando a pessoa sai ou a API encerra a sessão.
    return SecureStore.deleteItemAsync(chave);
}
