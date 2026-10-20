import { Op } from 'sequelize';
import Treino from '../models/treino.js';

export function listar(alunoId, inicio, fim) {
    return Treino.findAll({
        where: {
            alunoId: alunoId,
            estado: ['completo', 'parcial'],
            encerradoEm: {
                [Op.gte]: new Date(inicio + 'T03:00:00Z'),
                [Op.lt]: new Date(fim + 'T03:00:00Z'),
            },
        },
        order: [['encerradoEm', 'ASC'], ['id', 'ASC']],
        limit: 1000,
    });
}
