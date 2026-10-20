import { Op } from 'sequelize';
import Aluno from '../models/aluno.js';
import Pessoa from '../models/pessoa.js';
import Beneficio from '../models/beneficio.js';
import Funcionario from '../models/funcionario.js';
import Conta from '../models/conta.js';

export function buscarConta(id, transacao) {
    return Conta.findByPk(id, {
        attributes: ['id', 'alunoId', 'ativo'],
        transaction: transacao,
    });
}

export function buscar(contaId, transacao) {
    return Funcionario.findByPk(contaId, {
        transaction: transacao,
    });
}

export async function listar(pagina) {
    const registros = await Funcionario.findAll({
        order: [['numeroMatricula', 'ASC']],
        limit: 30,
        offset: pagina * 30,
    });
    const contas = await consultarIdentidades({
        id: registros.map(function conta(item) { return item.contaId; }),
    });
    return registros.map(function apresentar(registro) {
        const conta = contas.find(function mesma(item) { return item.id === registro.contaId; });
        return Object.assign({}, registro.toJSON(), {
            identidade: apresentarIdentidade(conta),
        });
    });
}

function consultarIdentidades(condicoes, filtroAluno = {}, filtroPessoa = {}) {
    return Conta.findAll({
        attributes: ['id', 'alunoId'],
        where: condicoes,
        include: [{
            model: Aluno,
            as: 'aluno',
            attributes: ['id', 'numeroMatricula'],
            where: filtroAluno,
            include: [{
                model: Pessoa,
                as: 'pessoa',
                attributes: ['nome'],
                where: filtroPessoa,
            }],
        }],
        order: [['id', 'ASC']],
        limit: 30,
    });
}

function apresentarIdentidade(conta) {
    if (!conta || !conta.aluno || !conta.aluno.pessoa) {
        return null;
    }
    return {
        contaId: conta.id,
        alunoId: conta.alunoId,
        nome: conta.aluno.pessoa.nome,
        matricula: 'A' + String(conta.aluno.numeroMatricula).padStart(6, '0'),
    };
}

export async function buscarContas(busca) {
    const filtroAluno = {};
    const filtroPessoa = {};
    if (/^A\d+$/i.test(busca)) {
        filtroAluno.numeroMatricula = busca.slice(1).replace(/^0+/, '') || '0';
    } else {
        filtroPessoa.nome = {
            [Op.iLike]: '%' + busca.replace(/[%_\\]/g, '') + '%',
        };
    }
    const contas = await consultarIdentidades({
        ativo: true,
    }, filtroAluno, filtroPessoa);
    const vinculos = await Funcionario.findAll({
        where: {
            contaId: contas.map(function conta(item) { return item.id; }),
        },
    });
    return contas.map(function apresentar(conta) {
        const vinculo = vinculos.find(function mesmo(item) { return item.contaId === conta.id; });
        let atual = null;
        if (vinculo) { atual = vinculo.toJSON(); }
        return Object.assign({}, apresentarIdentidade(conta), {
            vinculo: atual,
        });
    });
}

export function revogarBeneficiosFuncionais(alunoId, transacao) {
    return Beneficio.update({
        revogadoEm: new Date(),
    }, {
        where: {
            alunoId: alunoId,
            origem: 'funcional',
            revogadoEm: null,
        },
        transaction: transacao,
    });
}

export function salvar(dados, transacao) {
    return Funcionario.upsert(dados, {
        transaction: transacao,
    });
}
