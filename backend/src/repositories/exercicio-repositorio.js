import { Op } from 'sequelize';
import Exercicio from '../models/exercicio.js';
import banco from '../config/banco.js';

export function prepararExercicios(dados) {
    return banco.transaction(function inserir(transacao) {
        return Exercicio.bulkCreate(dados, {
            ignoreDuplicates: true,
            validate: true,
            transaction: transacao,
        });
    });
}

export function listar(filtros) {
    const condicoes = {
        ativo: true,
    };
    if (filtros.busca) {
        condicoes.nome = {
            [Op.iLike]: '%' + filtros.busca.replace(/[\\%_]/g, '\\$&') + '%',
        };
    }
    if (filtros.grupo) {
        condicoes.grupoMuscular = {
            [Op.iLike]: filtros.grupo.replace(/[\\%_]/g, '\\$&'),
        };
    }
    return Exercicio.findAndCountAll({
        where: condicoes,
        order: [['nome', 'ASC'], ['id', 'ASC']],
        limit: filtros.limite,
        offset: filtros.pagina * filtros.limite,
    });
}

export function buscarPorId(id) {
    return Exercicio.findByPk(id);
}

export function buscarPorIds(ids, transacao) {
    return Exercicio.findAll({
        where: {
            id: ids,
        },
        transaction: transacao,
    });
}
