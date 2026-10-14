import { Op } from 'sequelize';
import Pessoa from '../models/pessoa.js';
import Aluno from '../models/aluno.js';

export async function listarAlunos(filtros) {

    const filtroAluno = {};

    const filtroPessoa = {};

    if (/^A\d{1,19}$/i.test(filtros.busca)) {

        filtroAluno.numeroMatricula = BigInt(filtros.busca.slice(1)).toString();

    } else if (filtros.busca) {

        const nome = filtros.busca.replace(/[\\%_]/g, '\\$&');

        filtroPessoa.nome = {

            [Op.iLike]: '%' + nome + '%',
        };
    }

    return Aluno.findAndCountAll({

        where: filtroAluno,

        attributes: ['id', 'numeroMatricula', 'ativo', 'criadoEm'],

        include: [{

            model: Pessoa,

            as: 'pessoa',

            where: filtroPessoa,

            attributes: ['nome'],
        }],

        limit: filtros.limite,

        offset: (filtros.pagina - 1) * filtros.limite,

        order: [['numeroMatricula', 'ASC']],
    });
}

export async function buscarAlunoPorId(id) {

    return Aluno.findByPk(id, {

        include: [{

            model: Pessoa,

            as: 'pessoa',
        }],
    });
}
