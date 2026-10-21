import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { solicitarApi } from './api';
import { solicitarPermissao } from './notificacao-servico';

function projeto() {
    if (Constants.easConfig && Constants.easConfig.projectId) { return Constants.easConfig.projectId; }
    if (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.eas) {
        return Constants.expoConfig.extra.eas.projectId;
    }
    return '';
}
export async function ativarPush(alunoId) {
    if (!Device.isDevice || Platform.OS === 'web') { throw new Error('Ative os avisos em um aparelho Android ou iOS.'); }
    if (Constants.executionEnvironment === 'storeClient') { throw new Error('Avisos remotos precisam do aplicativo instalado, fora do Expo Go.'); }
    const projectId = projeto();
    if (!projectId) { throw new Error('O projeto de notificações ainda não foi configurado nesta versão do aplicativo.'); }
    if (!await solicitarPermissao()) { throw new Error('Permissão de notificações não concedida. Você pode alterá-la nas configurações do aparelho.'); }
    const resultado = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
    });
    await solicitarApi('/notificacoes/dispositivo', {
        method: 'PUT',
        body: JSON.stringify({
            token: resultado.data,
        }),
    });
    await SecureStore.setItemAsync('academia.push.' + alunoId, resultado.data);
    return resultado.data;
}
export async function desativarPush(alunoId) {
    const token = await SecureStore.getItemAsync('academia.push.' + alunoId);
    if (!token) { throw new Error('Nenhum dispositivo foi ativado por esta conta neste aparelho.'); }
    await solicitarApi('/notificacoes/dispositivo', {
        method: 'DELETE',
        body: JSON.stringify({
            token: token,
        }),
    });
    await SecureStore.deleteItemAsync('academia.push.' + alunoId);
}
