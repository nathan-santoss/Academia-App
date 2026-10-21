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

export function listar(pagina) {
    return Funcionario.findAll({
        order: [['numeroMatricula', 'ASC']],
        limit: 30,
        offset: pagina * 30,
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
