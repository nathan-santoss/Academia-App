// Coordeno a gravação dos lembretes e seus avisos, preservando anotações sem permissão de notificação.
import { excluirLembreteSalvo, inserirLembrete, listarLembretesSalvos } from '../repositories/lembrete-repositorio.js';
import { agendarNotificacao, cancelarNotificacao, consultarNotificacoes, identificarNotificacao, solicitarPermissao } from './notificacao-servico.js';

export async function cadastrarLembrete(dados, avisar) {
    // Salvo primeiro para preservar o lembrete mesmo se a permissão for negada.
    const lembrete = await inserirLembrete(dados);
    let mensagem = 'Lembrete salvo neste aparelho, sem aviso.';

    if (avisar) {
        try {
            const permitido = await solicitarPermissao();

            if (permitido) {
                await agendarNotificacao(lembrete);
                mensagem = 'Lembrete salvo e aviso agendado neste aparelho.';
            } else {
                mensagem = 'Lembrete salvo, mas sem aviso. A permissão de notificações não foi concedida.';
            }
        } catch {
            // Confirmo a gravação já concluída, evitando que a pessoa salve uma cópia.
            mensagem = 'Lembrete salvo, mas não consegui agendar o aviso. Confira as permissões e o horário escolhido.';
        }
    }

    return {
        lembrete: lembrete,
        mensagem: mensagem,
    };
}

export async function listarLembretes() {
    const lembretes = await listarLembretesSalvos();
    let notificacoes = [];
    let aviso = '';

    try {
        notificacoes = await consultarNotificacoes();
    } catch {
        // Mantenho a lista disponível mesmo se o sistema não informar os avisos.
        aviso = 'Os lembretes foram carregados, mas não consegui conferir os avisos agendados.';
    }

    const dados = lembretes.map(function acrescentarSituacao(lembrete) {
        let situacao = 'Sem aviso agendado';
        const agendado = notificacoes.some(function encontrarAviso(notificacao) {
            return notificacao.identifier === identificarNotificacao(lembrete.id);
        });

        // Descrevo o agendamento sem afirmar que o aparelho entregou uma notificação.
        if (new Date(lembrete.dataHora).getTime() <= Date.now()) {
            situacao = 'Horário passado';
        } else if (aviso) {
            situacao = 'Aviso não verificado';
        } else if (agendado) {
            situacao = 'Aviso agendado';
        }

        return {
            ...lembrete,
            situacao: situacao,
        };
    });

    return {
        dados: dados,
        aviso: aviso,
    };
}

export async function excluirLembrete(id) {
    // Cancelo antes de apagar para não deixar um aviso futuro sem registro na lista.
    await cancelarNotificacao(id);
    await excluirLembreteSalvo(id);
}
