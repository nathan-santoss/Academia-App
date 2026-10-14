// Coordeno a gravação dos lembretes e seus avisos, preservando anotações sem permissão de notificação.
import { solicitarApi } from './api.js';
import { obterIdInstalacao } from './instalacao-servico.js';
import { agendarNotificacao, cancelarNotificacao, consultarNotificacoes, identificarNotificacao, solicitarPermissao } from './notificacao-servico.js';

export async function cadastrarLembrete(dados, avisar, pedidoId) {
    // Espero a confirmação do Neon antes de agendar o aviso neste celular.
    const aparelhoId = await obterIdInstalacao();
    const resultado = await solicitarApi('/lembretes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Aparelho-ID': aparelhoId,
            'Idempotency-Key': pedidoId,
        },
        body: JSON.stringify(dados),
    });
    const lembrete = resultado.dados;
    let mensagem = 'Lembrete salvo online, sem aviso.';

    if (avisar) {
        try {
            const permitido = await solicitarPermissao();

            if (permitido) {
                await agendarNotificacao(lembrete);
                mensagem = 'Lembrete salvo online e aviso agendado neste aparelho.';
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
    // Busco no backend só as anotações desta instalação do aplicativo.
    const aparelhoId = await obterIdInstalacao();
    const resultado = await solicitarApi('/lembretes', {
        headers: {
            'X-Aparelho-ID': aparelhoId,
        },
    });
    const lembretes = resultado.dados;
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

        // Acrescento a situação numa cópia, sem mudar os dados que vieram da API.
        return Object.assign({}, lembrete, {
            situacao: situacao,
        });
    });

    return {
        dados: dados,
        aviso: aviso,
    };
}

export async function excluirLembrete(id) {
    // Apago no banco primeiro; se a rede falhar, mantenho o aviso já agendado.
    const aparelhoId = await obterIdInstalacao();
    await solicitarApi('/lembretes/' + encodeURIComponent(id), {
        method: 'DELETE',
        headers: {
            'X-Aparelho-ID': aparelhoId,
        },
    });

    try {
        await cancelarNotificacao(id);
        return '';
    } catch {
        // Distingo a exclusão concluída de uma falha ao cancelar o aviso no aparelho.
        return 'Lembrete excluído online, mas não consegui cancelar o aviso neste aparelho.';
    }
}
