import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AESEncryptionKey, AESSealedData, aesEncryptAsync, aesDecryptAsync } from 'expo-crypto';

let fila = Promise.resolve();

async function obterChave(alunoId) {
    const nome = 'academia.treino.chave.' + alunoId;
    const salva = await SecureStore.getItemAsync(nome);
    if (salva) {
        return AESEncryptionKey.import(salva, 'hex');
    }
    const chave = await AESEncryptionKey.generate();
    await SecureStore.setItemAsync(nome, await chave.encoded('hex'), {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return chave;
}

export async function lerRascunho(alunoId, tipo) {
    await fila;
    const cifrado = await AsyncStorage.getItem('academia.' + tipo + '.' + alunoId);
    if (!cifrado) {
        return null;
    }
    const chaveSalva = await SecureStore.getItemAsync('academia.treino.chave.' + alunoId);
    if (!chaveSalva) {
        throw new Error('O aparelho perdeu a chave do rascunho. Os dados locais nÃ£o podem ser recuperados.');
    }
    const chave = await AESEncryptionKey.import(chaveSalva, 'hex');
    const bytesCifrados = Uint8Array.from(atob(cifrado), function converter(caractere) {
        return caractere.charCodeAt(0);
    });
    const dados = await aesDecryptAsync(AESSealedData.fromCombined(bytesCifrados), chave);
    return JSON.parse(new TextDecoder().decode(dados));
}

export function guardarRascunho(alunoId, tipo, dados) {
    const texto = JSON.stringify(dados);
    // Enfileiro escritas para uma gravaÃ§Ã£o antiga nÃ£o substituir a ediÃ§Ã£o mais recente.
    const gravacao = fila.then(async function proteger() {
        const bytes = new TextEncoder().encode(texto);
        if (bytes.length > 256000) {
            throw new Error('O rascunho atingiu o limite local. Sincronize antes de continuar.');
        }
        const chave = await obterChave(alunoId);
        const cifrado = await aesEncryptAsync(bytes, chave);
        await AsyncStorage.setItem('academia.' + tipo + '.' + alunoId, await cifrado.combined('base64'));
    });
    fila = gravacao.catch(function liberarProximaGravacao() {});
    return gravacao;
}

export function apagarRascunho(alunoId, tipo) {
    const limpeza = fila.then(function limparConfirmado() {
        return AsyncStorage.removeItem('academia.' + tipo + '.' + alunoId);
    });
    fila = limpeza.catch(function liberarProximaGravacao() {});
    return limpeza;
}
