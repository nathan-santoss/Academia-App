import { Op } from 'sequelize';
import ModeloTreino from '../models/modelo-treino.js';

export function listar(contaId, pagina) {
    return ModeloTreino.findAll({
        where: {
            ativo: true,
            [Op.or]: [{
                autorContaId: contaId,
            }, {
                oficial: true,
            }],
        },
        order: [['criadoEm', 'DESC'], ['id', 'DESC']],
        limit: 30,
        offset: pagina * 30,
    });
}

export function buscar(id, transacao) {
    return ModeloTreino.findByPk(id, {
        transaction: transacao,
    });
}

export function criar(dados, transacao) {
    return ModeloTreino.create(dados, {
        transaction: transacao,
    });
}

export function atualizar(modelo, dados, transacao) {
    return modelo.update(dados, {
        transaction: transacao,
    });
}
