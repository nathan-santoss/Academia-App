import * as repositorio from '../repositories/financeiro-repositorio.js';
import { exigirAlgumPapel } from './equipe-servico.js';
import { executarOperacao } from './operacao-servico.js';
import { registrarAuditoria } from './auditoria-servico.js';
import { notificarAluno } from './notificacao-servico.js';
import { consultarCobertura } from './cobertura-servico.js';
import { validarPagamento, calcularPeriodo, estadoAssinatura } from '../utils/validar-financeiro.js';
import { exigirId } from '../utils/validar-id.js';
import { obterPagina } from '../utils/validar-pagina.js';
import { diaAcademia } from '../utils/dia-academia.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function consultarSituacao(acesso, alunoId) {
    exigirId(alunoId);
    if (alunoId !== acesso.alunoId) {
        await exigirAlgumPapel(acesso, ['recepcao', 'gestao']);
    }
    return consultarCobertura(alunoId);
}

export async function listarPagamentos(acesso, alunoId, pagina) {
    exigirId(alunoId);
    if (alunoId !== acesso.alunoId) {
        await exigirAlgumPapel(acesso, ['recepcao', 'gestao']);
    }
    return repositorio.listarPagamentos(alunoId, obterPagina(pagina));
}

export async function registrarPagamento(acesso, alunoId, entrada, operacaoId) {
    await exigirAlgumPapel(acesso, ['recepcao', 'gestao']);
    const dados = validarPagamento(entrada);
    return executarOperacao(acesso, alunoId, operacaoId, 'registrar_pagamento', dados, async function registrar(transacao) {
        const plano = await repositorio.buscarPlano(dados.planoId, transacao);
        if (!plano || !plano.ativo) {
            throw erroOperacao(422, 'Escolha um plano ativo.');
        }
        if (plano.precoCentavos !== dados.valorCentavos) {
            throw erroOperacao(409, 'O valor deve corresponder ao preço integral atual do plano.');
        }
        const pagamento = await repositorio.criarPagamento(Object.assign({}, dados, {
            alunoId: alunoId,
            plano: plano.toJSON(),
            registradoPor: acesso.contaId,
        }), transacao);
        await registrarAuditoria(acesso, alunoId, 'pagamento_registrado', pagamento.id, {
            valorCentavos: dados.valorCentavos,
        }, transacao);
        return pagamento;
    });
}

export async function confirmarPagamento(acesso, alunoId, id, operacaoId) {
    await exigirAlgumPapel(acesso, ['recepcao', 'gestao']);
    exigirId(id);
    return executarOperacao(acesso, alunoId, operacaoId, 'confirmar_pagamento', {
        pagamentoId: id,
    }, async function confirmar(transacao) {
        const pagamento = await repositorio.buscarPagamento(id, transacao);
        if (!pagamento || pagamento.alunoId !== alunoId) {
            throw erroOperacao(404, 'Pagamento não encontrado neste aluno.');
        }
        if (pagamento.confirmadoEm) {
            return pagamento;
        }
        const dia = diaAcademia();
        const anterior = await repositorio.buscarAssinatura(alunoId, transacao);
        const estado = estadoAssinatura(anterior, dia);
        let inicio = dia;
        if (estado === 'vigente') {
            throw erroOperacao(409, 'O período pago ainda está vigente. Aguarde o vencimento para evitar coberturas sobrepostas.');
        }
        if (estado === 'tolerancia') {
            if (pagamento.planoId !== anterior.planoId) {
                throw erroOperacao(409, 'Troca de plano durante tolerância aguarda definição.');
            }
            inicio = anterior.vencimento;
        }
        const periodo = calcularPeriodo(inicio, pagamento.plano.periodo);
        const assinatura = await repositorio.criarAssinatura(Object.assign({}, periodo, {
            alunoId: alunoId,
            planoId: pagamento.planoId,
            plano: pagamento.plano,
        }), transacao);
        await repositorio.confirmarPagamento(pagamento, {
            confirmadoPor: acesso.contaId,
            confirmadoEm: new Date(),
            assinaturaId: assinatura.id,
        }, transacao);
        await registrarAuditoria(acesso, alunoId, 'pagamento_confirmado', id, {
            assinaturaId: assinatura.id,
            periodo: periodo,
        }, transacao);
        await notificarAluno(alunoId, 'pagamento:' + id, 'Pagamento confirmado. Consulte a situação atual do seu plano.', '/financeiro/situacao', transacao);
        return pagamento;
    });
}

export async function cancelarRenovacao(acesso, alunoId, operacaoId) {
    await exigirAlgumPapel(acesso, ['recepcao', 'gestao']);
    return executarOperacao(acesso, alunoId, operacaoId, 'cancelar_renovacao', {}, async function cancelar(transacao) {
        const assinatura = await repositorio.buscarAssinatura(alunoId, transacao);
        if (!assinatura) {
            throw erroOperacao(404, 'Assinatura não encontrada.');
        }
        if (!assinatura.canceladaEm) {
            await repositorio.cancelarAssinatura(assinatura, transacao);
            await registrarAuditoria(acesso, alunoId, 'renovacao_cancelada', assinatura.id, {
                vencimentoPreservado: assinatura.vencimento,
            }, transacao);
        }
        return assinatura;
    });
}

export async function consultarPendencias(acesso) {
    await exigirAlgumPapel(acesso, ['gestao', 'recepcao']);
    return repositorio.consultarPendencias(diaAcademia());
}
