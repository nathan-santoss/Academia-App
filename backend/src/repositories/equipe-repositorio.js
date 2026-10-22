import { Op } from 'sequelize';
import Funcionario from '../models/funcionario.js';
import Chegada from '../models/chegada.js';
import Aluno from '../models/aluno.js';
import Pessoa from '../models/pessoa.js';

export function buscarFuncionario(contaId, transacao) {
    return Funcionario.findByPk(contaId, {
        transaction: transacao,
    });
}

export async function buscarAlunos(busca) {
    const filtroAluno = {
        ativo: true,
    };
    const filtroPessoa = {};
    if (/^A\d+$/i.test(busca)) {
        filtroAluno.numeroMatricula = busca.slice(1).replace(/^0+/, '') || '0';
    } else {
        filtroPessoa.nome = {
            [Op.iLike]: '%' + busca.replace(/[%_\\]/g, '') + '%',
        };
    }
    const alunos = await Aluno.findAll({
        where: filtroAluno,
        attributes: ['id', 'numeroMatricula'],
        include: [{
            model: Pessoa,
            as: 'pessoa',
            attributes: ['nome'],
            where: filtroPessoa,
        }],
        limit: 30,
        order: [['numeroMatricula', 'ASC']],
    });
    return alunos.map(function apresentar(aluno) {
        return {
            id: aluno.id,
            nome: aluno.pessoa.nome,
            matricula: 'A' + String(aluno.numeroMatricula).padStart(6, '0'),
        };
    });
}

export function buscarChegada(alunoId, dia, transacao) {
    return Chegada.findOne({
        where: {
            alunoId: alunoId,
            dia: dia,
        },
        transaction: transacao,
    });
}

export async function listarFila(dia, pagina) {
    const chegadas = await Chegada.findAll({
        where: {
            dia: dia,
            confirmadaEm: null,
        },
        order: [['criadoEm', 'ASC'], ['id', 'ASC']],
        limit: 30,
        offset: pagina * 30,
    });
    const alunos = await Aluno.findAll({
        attributes: ['id', 'numeroMatricula'],
        where: {
            id: chegadas.map(function aluno(chegada) { return chegada.alunoId; }),
        },
        include: [{
            model: Pessoa,
            as: 'pessoa',
            attributes: ['nome'],
        }],
    });
    return chegadas.map(function apresentar(chegada) {
        const aluno = alunos.find(function mesmo(item) { return item.id === chegada.alunoId; });
        let identidade = null;
        if (aluno && aluno.pessoa) {
            identidade = {
                id: aluno.id,
                nome: aluno.pessoa.nome,
                matricula: 'A' + String(aluno.numeroMatricula).padStart(6, '0'),
            };
        }
        return Object.assign({}, chegada.toJSON(), {
            aluno: identidade,
        });
    });
}

export function criarChegada(dados, transacao) {
    return Chegada.create(dados, {
        transaction: transacao,
    });
}

export function atualizarChegada(chegada, dados, transacao) {
    return chegada.update(dados, {
        transaction: transacao,
    });
}
