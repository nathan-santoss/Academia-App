import { Op } from 'sequelize';
import Auditoria from '../models/auditoria.js';

export function registrar(dados, transacao) {
    return Auditoria.create(dados, {
        transaction: transacao,
    });
}

export function listar(alunoId, pagina) {
    const filtro = {
        acao: {
            [Op.notIn]: ['medida_corrigida', 'treino_corrigido'],
        },
    };
    if (alunoId) {
        filtro.alunoId = alunoId;
    }
    return Auditoria.findAll({
        where: filtro,
        order: [['criadoEm', 'DESC'], ['id', 'DESC']],
        limit: 30,
        offset: pagina * 30,
    });
}
