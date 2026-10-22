import Conta from '../models/conta.js';
import Recuperacao from '../models/recuperacao.js';
import Sessao from '../models/sessao.js';

export function buscarConta(email, transacao) {
    return Conta.findOne({
        where: {
            email: email,
            ativo: true,
        },
        transaction: transacao,
    });
}

export function salvar(dados, transacao) {
    return Recuperacao.upsert(dados, {
        transaction: transacao,
    });
}

export function buscar(contaId, transacao) {
    return Recuperacao.findByPk(contaId, {
        transaction: transacao,
        lock: transacao.LOCK.UPDATE,
    });
}

export function atualizar(registro, dados, transacao) {
    return registro.update(dados, {
        transaction: transacao,
    });
}

export async function trocarSenha(conta, hash, transacao) {
    await conta.update({
        senhaProtegida: hash,
    }, {
        transaction: transacao,
    });
    await Sessao.destroy({
        where: {
            contaId: conta.id,
        },
        transaction: transacao,
    });
}
