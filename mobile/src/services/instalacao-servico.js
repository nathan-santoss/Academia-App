// Guardo o código desta instalação para buscar seus lembretes no backend, sem salvar as anotações no celular.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';

const chaveInstalacao = 'academia:instalacao';
let leituraEmAndamento = null;

async function lerOuCriarId() {
    // Reaproveito o mesmo código quando o aplicativo é aberto de novo.
    const salvo = await AsyncStorage.getItem(chaveInstalacao);

    if (salvo) {
        return salvo;
    }

    // Crio um código novo só na primeira abertura; ele identifica a instalação, mas não é um login.
    const id = randomUUID();
    await AsyncStorage.setItem(chaveInstalacao, id);
    return id;
}

export async function obterIdInstalacao() {
    // Compartilho a leitura para dois pedidos juntos não criarem códigos diferentes.
    if (!leituraEmAndamento) {
        leituraEmAndamento = lerOuCriarId();
    }

    try {
        return await leituraEmAndamento;
    } catch (falha) {
        // Permito tentar de novo caso o armazenamento do aparelho falhe.
        leituraEmAndamento = null;
        throw falha;
    }
}
