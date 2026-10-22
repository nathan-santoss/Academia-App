import DetalheExercicio from '../models/detalhe-exercicio.js';
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
        const busca = '%' + filtros.busca.replace(/[\\%_]/g, '\\$&') + '%';
        condicoes[Op.or] = [{
            nome: {
                [Op.iLike]: busca,
            },
        }, {
            '$detalhes.termos_busca$': {
                [Op.iLike]: busca,
            },
        }];
    }
    if (filtros.grupo) {
        condicoes.grupoMuscular = {
            [Op.iLike]: filtros.grupo.replace(/[\\%_]/g, '\\$&'),
        };
    }
    return Exercicio.findAndCountAll({
        where: condicoes,
        include: [{
            model: DetalheExercicio,
            as: 'detalhes',
        }],
        order: [['nome', 'ASC'], ['id', 'ASC']],
        limit: filtros.limite,
        offset: filtros.pagina * filtros.limite,
    });
}

export function buscarPorId(id, transacao) {
    return Exercicio.findByPk(id, {
        transaction: transacao,
        include: [{
            model: DetalheExercicio,
            as: 'detalhes',
        }],
    });
}

export async function salvarExercicio(id, dados, atual, transacao) {
    if (atual) {
        return atual.update(dados, {
            transaction: transacao,
        });
    }
    return Exercicio.create(Object.assign({}, dados, {
        id: id,
        codigo: 'exercicio-' + id,
    }), {
        transaction: transacao,
    });
}

export function salvarDetalhes(dados, transacao) {
    return DetalheExercicio.upsert(dados, {
        transaction: transacao,
    });
}

export function buscarPorIds(ids, transacao) {
    return Exercicio.findAll({
        where: {
            id: ids,
        },
        transaction: transacao,
    });
}
