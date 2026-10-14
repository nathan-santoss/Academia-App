import * as SecureStore from 'expo-secure-store';

const chave = 'academia.identidade.local';

export async function guardarIdentidade(usuario) {
    // Guardo somente a referência necessária para retomar o rascunho da mesma conta.
    await SecureStore.setItemAsync(chave, JSON.stringify({
        id: usuario.id,
        nome: usuario.nome,
        matricula: usuario.matricula,
    }), {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
}

export async function obterIdentidade() {
    const texto = await SecureStore.getItemAsync(chave);
    if (!texto) { return null; }
    return JSON.parse(texto);
}

export function apagarIdentidade() {
    return SecureStore.deleteItemAsync(chave);
}
