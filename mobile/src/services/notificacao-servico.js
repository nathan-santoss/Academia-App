// Solicito permissão e organizo a apresentação, o agendamento e o cancelamento dos avisos locais.
// Converso com o sistema Android ou iOS para pedir permissão, agendar, consultar e cancelar avisos locais. Não salvo
// alunos nem envio mensagens pela internet; lembrete-servico.js decide quando me chamar.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Registro como os avisos locais devem aparecer quando o aplicativo está aberto.
export function configurarNotificacoes() {
    // Apresento o aviso também quando o aplicativo estiver aberto, sem pedir acesso aqui.
    Notifications.setNotificationHandler({
        // Entrego ao Expo as opções de apresentação para uma notificação recebida com o app em uso.
        handleNotification: async function apresentarAviso() {
            // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
            return {
                // Permito que o sistema apresente o aviso como banner quando o app estiver aberto.
                shouldShowBanner: true,
                // Permito incluir o aviso na lista de notificações do sistema.
                shouldShowList: true,
                // Escolho se este aviso toca som; neste fluxo uso avisos silenciosos.
                shouldPlaySound: false,
                // Defino se este aviso muda o contador no ícone do aplicativo.
                shouldSetBadge: false,
            }; // Concluo este objeto com os campos que a etapa atual precisa.
        }, // Termino apresentarAviso e devolvo o controle a quem chamou.
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino configurarNotificacoes e devolvo o controle a quem chamou.

// Confiro a permissão normal e também o modo provisório do iOS, que permite avisos silenciosos.
function permissaoAceita(permissao) {
    // Aceito a permissão que o sistema já marcou como concedida.
    if (permissao.granted) {
        // Devolvo true como resultado desta conferência para quem chamou a função.
        return true;
    } // Encerro a conferência de permissao.granted.

    // Aceito o modo provisório do iOS, que entrega avisos silenciosos.
    if (permissao.ios) {
        // Entrego o resultado da comparação entre permissao.ios.status e
        // Notifications.IosAuthorizationStatus.PROVISIONAL a quem chamou a função e termino este caminho.
        return permissao.ios.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    } // Encerro a conferência de permissao.ios.

    // Devolvo false como resultado desta conferência para quem chamou a função.
    return false;
} // Termino permissaoAceita e devolvo o controle a quem chamou.

// Preparo o canal Android, leio a permissão atual e só peço uma escolha quando o sistema permite perguntar.
export async function solicitarPermissao() {
    // Preparo o canal antes do pedido de permissão exigido pelo Android.
    if (Platform.OS === 'android') {
        // Espero esta tarefa terminar antes de continuar. Preparo o canal de lembretes no Android para o sistema
        // saber como apresentar seus avisos.
        await Notifications.setNotificationChannelAsync('lembretes', {
            // Dou um nome ao canal para a pessoa reconhecê-lo nas configurações de notificações do Android.
            name: 'Lembretes da academia',
            // Escolho a importância do canal Android, que participa da forma como o sistema apresenta o aviso.
            importance: Notifications.AndroidImportance.DEFAULT,
            // Indico o som do canal; null mantém a configuração silenciosa usada aqui.
            sound: null,
            // Defino a vibração do canal separadamente da vibração de confirmação dos botões.
            enableVibrate: false,
        }); // Concluo este objeto com os campos que a etapa atual precisa.
    } // Encerro a conferência de Platform.OS.

    // Espero o resultado antes de preencher permissao. Leio a permissão atual de notificações sem abrir um novo
    // pedido para a pessoa.
    let permissao = await Notifications.getPermissionsAsync();

    // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
    if (!permissaoAceita(permissao) && permissao.canAskAgain) {
        // Atualizo permissao com o resultado aguardado de Notifications.requestPermissionsAsync. Peço ao sistema que
        // apresente a solicitação de permissão e espero a escolha da pessoa.
        permissao = await Notifications.requestPermissionsAsync();
    } // Encerro a conferência de esta condição.

    // Devolvo o resultado desta chamada a quem pediu esta etapa. Confiro a permissão normal e também o modo
    // provisório do iOS, que permite avisos silenciosos.
    return permissaoAceita(permissao);
} // Termino solicitarPermissao e devolvo o controle a quem chamou.

// Derivo um nome estável do ID do lembrete para localizar ou cancelar o mesmo aviso depois.
export function identificarNotificacao(id) {
    // Ligo o aviso ao código do lembrete salvo online para conseguir cancelá-lo depois.
    return 'academia-lembrete-' + id;
} // Termino identificarNotificacao e devolvo o controle a quem chamou.

// Confiro se o horário ainda está no futuro e peço ao sistema o aviso local para aquele instante.
export async function agendarNotificacao(lembrete) {
    // Confiro novamente o horário porque a pessoa pode demorar na permissão.
    if (new Date(lembrete.dataHora).getTime() <= Date.now()) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw new Error('O horário escolhido já passou.');
    } // Encerro a conferência de .getTime.

    // Espero esta tarefa terminar antes de continuar. Peço ao sistema que guarde este aviso para o instante definido
    // no gatilho.
    await Notifications.scheduleNotificationAsync({
        // Forneço um nome estável ao aviso para encontrá-lo ou cancelá-lo mais tarde.
        identifier: identificarNotificacao(lembrete.id),
        // Junto o título e a mensagem que o sistema poderá mostrar na notificação.
        content: {
            // Escolho o título apresentado nesta tela, aba ou notificação.
            title: 'Lembrete da academia',
            // Mostro um aviso genérico para não expor o título pessoal do lembrete na notificação.
            body: 'Você tem um lembrete. Abra o aplicativo para consultar.',
        }, // Concluo os campos de content e volto ao objeto que reúne essa configuração.
        // Defino quando o sistema deve tentar apresentar o aviso agendado.
        trigger: {
            // Escolho o gatilho de data para agendar este aviso uma vez no instante informado.
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            // Passo a data do aviso como objeto Date para o agendamento entender o instante escolhido.
            date: new Date(lembrete.dataHora),
            // Associo o aviso ao canal Android preparado antes do pedido de permissão.
            channelId: 'lembretes',
        }, // Concluo os campos de trigger e volto ao objeto que reúne essa configuração.
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino agendarNotificacao e devolvo o controle a quem chamou.

// Peço ao sistema os avisos agendados; esse estado pertence ao aparelho, não ao cadastro no Neon.
export async function consultarNotificacoes() {
    // Consulto o sistema para não guardar no banco um estado de agendamento desatualizado.
    return Notifications.getAllScheduledNotificationsAsync();
} // Termino consultarNotificacoes e devolvo o controle a quem chamou.

// Localizo o aviso pelo ID do lembrete e peço seu cancelamento no sistema.
export async function cancelarNotificacao(id) {
    // Espero esta tarefa terminar antes de continuar. Cancelo somente o aviso que tem este identificador no aparelho.
    await Notifications.cancelScheduledNotificationAsync(identificarNotificacao(id));
} // Termino cancelarNotificacao e devolvo o controle a quem chamou.

// Retiro avisos agendados e já exibidos para a próxima pessoa não herdar as notificações da conta anterior.
export async function limparNotificacoes() {
    // Retiro os avisos agendados e já exibidos para não misturar duas pessoas no mesmo celular.
    await Notifications.cancelAllScheduledNotificationsAsync();
    // Espero esta tarefa terminar antes de continuar. Retiro da central do sistema os avisos já apresentados por este
    // app.
    await Notifications.dismissAllNotificationsAsync();
} // Termino limparNotificacoes e devolvo o controle a quem chamou.
