import { agendar } from './push-repositorio.js';
import Conta from '../models/conta.js';
import Notificacao from '../models/notificacao.js';

export function buscarContaAluno(alunoId, transacao) {
    return Conta.findOne({
        where: {
            alunoId: alunoId,
        },
        transaction: transacao,
    });
}

export async function criar(dados, transacao) {
    const notificacao = await Notificacao.create(dados, {
        transaction: transacao,
    });
    await agendar(notificacao, transacao);
    return notificacao;
}

export function listar(contaId, pagina) {
    return Notificacao.findAll({
        where: {
            contaId: contaId,
        },
        order: [['criadoEm', 'DESC'], ['id', 'DESC']],
        limit: 30,
        offset: pagina * 30,
    });
}

export function marcarLida(contaId, id) {
    return Notificacao.update({
        lidaEm: new Date(),
    }, {
        where: {
            id: id,
            contaId: contaId,
            lidaEm: null,
        },
    });
}
