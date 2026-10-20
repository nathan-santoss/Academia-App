import Medida from '../models/medida.js';
import Privacidade from '../models/privacidade.js';

export function listar(alunoId, pagina) {
    return Medida.findAll({
        where: {
            alunoId: alunoId,
        },
        order: [['dia', 'DESC'], ['id', 'DESC']],
        limit: 30,
        offset: pagina * 30,
    });
}

export function buscar(id, alunoId, transacao) {
    return Medida.findOne({
        where: {
            id: id,
            alunoId: alunoId,
        },
        transaction: transacao,
    });
}

export function criar(dados, transacao) {
    return Medida.create(dados, {
        transaction: transacao,
    });
}

export function corrigir(medida, dados, transacao) {
    return medida.update(dados, {
        transaction: transacao,
    });
}

export function buscarPrivacidade(alunoId, transacao) {
    return Privacidade.findByPk(alunoId, {
        transaction: transacao,
    });
}

export function salvarPrivacidade(dados, transacao) {
    return Privacidade.upsert(dados, {
        transaction: transacao,
    });
}
