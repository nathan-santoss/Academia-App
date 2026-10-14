// Solicito permissão e organizo a apresentação, o agendamento e o cancelamento dos avisos locais.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export function configurarNotificacoes() {
    // Apresento o aviso também quando o aplicativo estiver aberto, sem pedir acesso aqui.
    Notifications.setNotificationHandler({
        handleNotification: async function apresentarAviso() {
            return {
                shouldShowBanner: true,
                shouldShowList: true,
                shouldPlaySound: false,
                shouldSetBadge: false,
            };
        },
    });
}

function permissaoAceita(permissao) {
    if (permissao.granted) {
        return true;
    }

    // Aceito o modo provisório do iOS, que entrega avisos silenciosos.
    if (permissao.ios) {
        return permissao.ios.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    }

    return false;
}

export async function solicitarPermissao() {
    // Preparo o canal antes do pedido de permissão exigido pelo Android.
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('lembretes', {
            name: 'Lembretes da academia',
            importance: Notifications.AndroidImportance.DEFAULT,
            sound: null,
            enableVibrate: false,
        });
    }

    let permissao = await Notifications.getPermissionsAsync();

    if (!permissaoAceita(permissao) && permissao.canAskAgain) {
        permissao = await Notifications.requestPermissionsAsync();
    }

    return permissaoAceita(permissao);
}

export function identificarNotificacao(id) {
    // Ligo o aviso ao código do lembrete salvo online para conseguir cancelá-lo depois.
    return 'academia-lembrete-' + id;
}

export async function agendarNotificacao(lembrete) {
    // Confiro novamente o horário porque a pessoa pode demorar na permissão.
    if (new Date(lembrete.dataHora).getTime() <= Date.now()) {
        throw new Error('O horário escolhido já passou.');
    }

    await Notifications.scheduleNotificationAsync({
        identifier: identificarNotificacao(lembrete.id),
        content: {
            title: 'Lembrete da academia',
            body: 'Você tem um lembrete. Abra o aplicativo para consultar.',
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(lembrete.dataHora),
            channelId: 'lembretes',
        },
    });
}

export async function consultarNotificacoes() {
    // Consulto o sistema para não guardar no banco um estado de agendamento desatualizado.
    return Notifications.getAllScheduledNotificationsAsync();
}

export async function cancelarNotificacao(id) {
    await Notifications.cancelScheduledNotificationAsync(identificarNotificacao(id));
}

export async function limparNotificacoes() {
    // Retiro os avisos agendados e já exibidos para não misturar duas pessoas no mesmo celular.
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
}
