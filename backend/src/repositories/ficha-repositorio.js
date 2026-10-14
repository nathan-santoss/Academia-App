import RascunhoFicha from '../models/rascunho-ficha.js';
import Rotina from '../models/rotina.js';

export function buscarRascunho(alunoId, contaId, transacao) {
    return RascunhoFicha.findOne({
        where: {
            alunoId: alunoId,
            contaId: contaId,
        },
        transaction: transacao,
    });
}

export function criarRascunho(dados, transacao) {
    return RascunhoFicha.create(dados, {
        transaction: transacao,
    });
}

export function atualizarRascunho(rascunho, dados, transacao) {
    return rascunho.update(dados, {
        transaction: transacao,
    });
}

export function buscarPublicacao(id, transacao) {
    return Rotina.findByPk(id, {
        transaction: transacao,
    });
}
