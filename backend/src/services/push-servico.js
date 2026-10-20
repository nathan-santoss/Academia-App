import * as repositorio from '../repositories/push-repositorio.js';
import { executarTransacao } from '../repositories/treino-repositorio.js';
import { validarTokenPush } from '../utils/validar-push.js';

export async function registrar(acesso, entrada) {
    await repositorio.registrar({
        token: validarTokenPush(entrada),
        contaId: acesso.contaId,
        sessaoResumo: acesso.tokenResumo,
    });
    return {
        mensagem: 'Dispositivo vinculado à sessão atual.',
    };
}

export async function remover(acesso, entrada) {
    await repositorio.remover(validarTokenPush(entrada), acesso.contaId);
    return {
        mensagem: 'Notificações desativadas neste dispositivo.',
    };
}

async function chamarExpo(caminho, dados) {
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };
    if (process.env.EXPO_PUSH_ACCESS_TOKEN) {
        headers.Authorization = 'Bearer ' + process.env.EXPO_PUSH_ACCESS_TOKEN;
    }
    const resposta = await fetch('https://exp.host/--/api/v2/push/' + caminho, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(dados),
        signal: AbortSignal.timeout(10000),
    });
    if (!resposta.ok) {
        throw new Error('Serviço de push indisponível.');
    }
    return resposta.json();
}

export async function processarUmaEntrega() {
    if (process.env.PUSH_HABILITADO !== 'true') {
        return false;
    }
    return executarTransacao(async function enviar(transacao) {
        const entrega = await repositorio.buscarPendente(transacao);
        if (!entrega) {
            return false;
        }
        if (!await repositorio.sessaoAtiva(entrega, transacao)) {
            await repositorio.atualizar(entrega, {
                estado: 'cancelada',
            }, transacao);
            return true;
        }
        const tentativas = entrega.tentativas + 1;
        let estado = 'pendente';
        let ticketId = entrega.ticketId;
        try {
            let resultado;
            if (ticketId) {
                const recibos = await chamarExpo('getReceipts', {
                    ids: [ticketId],
                });
                if (recibos.data) {
                    resultado = recibos.data[ticketId];
                }
                estado = 'aguardando';
            } else {
                const envio = await chamarExpo('send', {
                    to: entrega.token,
                    title: 'Academia',
                    body: 'Você tem uma atualização. Abra o aplicativo para consultar.',
                    data: {
                        notificacaoId: entrega.notificacaoId,
                    },
                });
                resultado = envio.data;
                if (resultado && resultado.status === 'ok') {
                    ticketId = resultado.id;
                    estado = 'aguardando';
                }
            }
            if (resultado && resultado.status === 'ok' && entrega.ticketId) {
                estado = 'entregue';
            } else if (resultado && resultado.status === 'error') {
                estado = 'falhou';
                if (resultado.details && resultado.details.error === 'DeviceNotRegistered') {
                    await repositorio.remover(entrega.token, entrega.contaId, transacao);
                }
            }
        } catch {
            // Preservo o aviso interno mesmo quando o serviço externo falha.
            if (ticketId) {
                estado = 'aguardando';
            }
        }
        if (tentativas >= 6 && estado !== 'entregue') {
            estado = 'falhou';
        }
        await repositorio.atualizar(entrega, {
            estado: estado,
            ticketId: ticketId,
            tentativas: tentativas,
            proximaEm: new Date(Date.now() + Math.min(900000, 30000 * 2 ** tentativas)),
        }, transacao);
        return true;
    });
}
