import { Op } from 'sequelize';
import DispositivoPush from '../models/dispositivo-push.js';
import EntregaPush from '../models/entrega-push.js';
import Sessao from '../models/sessao.js';
import Conta from '../models/conta.js';

export function registrar(dados) {
    return DispositivoPush.upsert(dados);
}

export function remover(token, contaId, transacao) {
    return DispositivoPush.destroy({
        where: {
            token: token,
            contaId: contaId,
        },
        transaction: transacao,
    });
}

export async function agendar(notificacao, transacao) {
    const dispositivos = await DispositivoPush.findAll({
        where: {
            contaId: notificacao.contaId,
        },
        transaction: transacao,
    });
    await EntregaPush.bulkCreate(dispositivos.map(function entrega(dispositivo) {
        return {
            notificacaoId: notificacao.id,
            contaId: notificacao.contaId,
            token: dispositivo.token,
        };
    }), {
        transaction: transacao,
        ignoreDuplicates: true,
    });
}

export function buscarPendente(transacao) {
    return EntregaPush.findOne({
        where: {
            estado: ['pendente', 'aguardando'],
            proximaEm: {
                [Op.lte]: new Date(),
            },
        },
        order: [['proximaEm', 'ASC']],
        transaction: transacao,
        lock: transacao.LOCK.UPDATE,
        skipLocked: true,
    });
}

export async function sessaoAtiva(entrega, transacao) {
    const dispositivo = await DispositivoPush.findOne({
        where: {
            token: entrega.token,
            contaId: entrega.contaId,
        },
        transaction: transacao,
    });
    if (!dispositivo) {
        return false;
    }
    const sessao = await Sessao.findOne({
        where: {
            tokenResumo: dispositivo.sessaoResumo,
            contaId: entrega.contaId,
            expiraEm: {
                [Op.gt]: new Date(),
            },
        },
        include: [{
            model: Conta,
            as: 'conta',
            where: {
                ativo: true,
            },
        }],
        transaction: transacao,
    });
    return Boolean(sessao);
}

export function atualizar(entrega, dados, transacao) {
    return entrega.update(dados, {
        transaction: transacao,
    });
}
