// Leio e salvo a escolha de vibração no AsyncStorage para recuperá-la na próxima abertura.
import AsyncStorage from '@react-native-async-storage/async-storage';

const chavePreferencias = 'academia:preferencias';

export async function lerPreferencias() {
    // Recupero somente preferências do aparelho, sem armazenar dados de alunos.
    const texto = await AsyncStorage.getItem(chavePreferencias);

    if (!texto) {
        return false;
    }

    const preferencias = JSON.parse(texto);
    return preferencias.vibracaoAtiva === true;
}

export async function salvarPreferencias(vibracaoAtiva) {
    // Converto o objeto em texto porque o Storage guarda pares de chave e valor.
    await AsyncStorage.setItem(chavePreferencias, JSON.stringify({
        vibracaoAtiva: vibracaoAtiva,
    }));
}
