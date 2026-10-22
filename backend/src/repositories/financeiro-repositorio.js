import { Op } from 'sequelize';
import Assinatura from '../models/assinatura.js';
import Pagamento from '../models/pagamento.js';
import Beneficio from '../models/beneficio.js';
import Plano from '../models/plano.js';
import Conta from '../models/conta.js';
import Funcionario from '../models/funcionario.js';

export function buscarPlano(id, transacao) {
    return Plano.findByPk(id, {
        transaction: transacao,
        lock: transacao.LOCK.UPDATE,
    });
}

export function buscarAssinatura(alunoId, transacao) {
    return Assinatura.findOne({
        where: {
            alunoId: alunoId,
        },
        order: [['vencimento', 'DESC'], ['criadoEm', 'DESC']],
        transaction: transacao,
    });
}

export function criarAssinatura(dados, transacao) {
    return Assinatura.create(dados, {
        transaction: transacao,
    });
}

export function cancelarAssinatura(assinatura, transacao) {
    return assinatura.update({
        canceladaEm: new Date(),
    }, {
        transaction: transacao,
    });
}

export function buscarPagamento(id, transacao) {
    return Pagamento.findByPk(id, {
        transaction: transacao,
    });
}

export function criarPagamento(dados, transacao) {
    return Pagamento.create(dados, {
        transaction: transacao,
    });
}

export function confirmarPagamento(pagamento, dados, transacao) {
    return pagamento.update(dados, {
        transaction: transacao,
    });
}

export function listarPagamentos(alunoId, pagina) {
    return Pagamento.findAll({
        where: {
            alunoId: alunoId,
        },
        order: [['criadoEm', 'DESC'], ['id', 'DESC']],
        limit: 30,
        offset: pagina * 30,
    });
}

export function listarBeneficios(alunoId, transacao) {
    return Beneficio.findAll({
        where: {
            alunoId: alunoId,
            revogadoEm: null,
        },
        order: [['inicio', 'DESC']],
        transaction: transacao,
    });
}

export async function funcionarioDoAluno(alunoId, transacao) {
    const conta = await Conta.findOne({
        where: {
            alunoId: alunoId,
        },
        transaction: transacao,
    });
    if (!conta || !conta.ativo) {
        return null;
    }
    return Funcionario.findOne({
        where: {
            contaId: conta.id,
            ativo: true,
        },
        transaction: transacao,
    });
}

export function listarHistoricoBeneficios(alunoId, pagina) {
    return Beneficio.findAll({
        where: {
            alunoId: alunoId,
        },
        order: [['criadoEm', 'DESC'], ['id', 'DESC']],
        limit: 30,
        offset: pagina * 30,
    });
}

export function criarBeneficio(dados, transacao) {
    return Beneficio.create(dados, {
        transaction: transacao,
    });
}

export function buscarBeneficio(id, alunoId, transacao) {
    return Beneficio.findOne({
        where: {
            id: id,
            alunoId: alunoId,
        },
        transaction: transacao,
    });
}

export function revogarBeneficio(beneficio, transacao) {
    return beneficio.update({
        revogadoEm: new Date(),
    }, {
        transaction: transacao,
    });
}

export async function consultarPendencias(dia) {
    return {
        pagamentos: await Pagamento.findAll({
            where: {
                confirmadoEm: null,
            },
            order: [['criadoEm', 'ASC']],
            limit: 100,
        }),
        tolerancias: await Assinatura.findAll({
            where: {
                vencimento: {
                    [Op.lte]: dia,
                },
                toleranciaAte: {
                    [Op.gt]: dia,
                },
            },
            order: [['toleranciaAte', 'ASC']],
            limit: 100,
        }),
    };
}
