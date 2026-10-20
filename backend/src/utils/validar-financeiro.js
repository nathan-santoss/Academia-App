import { exigirTexto, exigirNumero } from './validar-rotina.js';
import { exigirId } from './validar-id.js';
import { erroOperacao } from './erro-operacao.js';

export function exigirDia(valor) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        throw erroOperacao(422, 'Informe uma data no formato AAAA-MM-DD.');
    }
    const data = new Date(valor + 'T12:00:00Z');
    if (!Number.isFinite(data.getTime()) || data.toISOString().slice(0, 10) !== valor) {
        throw erroOperacao(422, 'Informe uma data existente.');
    }
    return valor;
}

export function somarDias(dia, quantidade) {
    const data = new Date(exigirDia(dia) + 'T12:00:00Z');
    data.setUTCDate(data.getUTCDate() + quantidade);
    return data.toISOString().slice(0, 10);
}

export function calcularPeriodo(inicio, periodo) {
    exigirDia(inicio);
    let vencimento;
    let tolerancia = 0;
    if (periodo === 'diario') {
        vencimento = somarDias(inicio, 1);
    } else if (periodo === 'quinzenal') {
        vencimento = somarDias(inicio, 15);
    } else {
        const meses = {
            mensal: 1,
            trimestral: 3,
            semestral: 6,
            anual: 12,
        };
        if (!meses[periodo]) {
            throw erroOperacao(422, 'Período de plano inválido.');
        }
        const data = new Date(inicio + 'T12:00:00Z');
        // Bloqueio aniversários sem regra aprovada, inclusive quando o mês de destino comportaria o dia.
        if (data.getUTCDate() > 28) {
            throw erroOperacao(409, 'Vencimentos com aniversário nos dias 29, 30 e 31 aguardam definição da Gestão.');
        }
        data.setUTCMonth(data.getUTCMonth() + meses[periodo]);
        vencimento = data.toISOString().slice(0, 10);
        tolerancia = 5;
    }
    return {
        inicio: inicio,
        vencimento: vencimento,
        toleranciaAte: somarDias(vencimento, tolerancia),
    };
}

export function estadoAssinatura(assinatura, dia) {
    if (!assinatura || dia < assinatura.inicio) {
        return 'sem_cobertura';
    }
    if (dia < assinatura.vencimento) {
        return 'vigente';
    }
    if (dia < assinatura.toleranciaAte) {
        return 'tolerancia';
    }
    return 'suspensa';
}

export function validarPagamento(entrada) {
    if (!entrada || !['dinheiro', 'pix', 'debito', 'credito'].includes(entrada.metodo)) {
        throw erroOperacao(422, 'Escolha dinheiro, Pix, débito ou crédito.');
    }
    let comprovante = null;
    if (entrada.comprovante) {
        comprovante = exigirTexto(entrada.comprovante, 'referência do comprovante', 500);
    }
    return {
        planoId: exigirId(entrada.planoId),
        valorCentavos: exigirNumero(entrada.valorCentavos, 'valor em centavos', 1, 2147483647),
        metodo: entrada.metodo,
        comprovante: comprovante,
    };
}
