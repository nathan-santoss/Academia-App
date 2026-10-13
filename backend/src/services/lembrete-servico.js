// Valido os lembretes da instalação e mantenho seus registros no Neon.
import { consultarRegistros, registrarOperacao } from './persistencia-servico.js';
import { exigirId, obterIdOperacao } from '../utils/validar-id.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function listarLembretes(aparelhoId) {
    return consultarRegistros('lembrete', exigirId(aparelhoId));
}

export function salvarLembrete(entrada, aparelhoId, operacaoId) {
    const instalacaoId = exigirId(aparelhoId);
    const pedidoId = obterIdOperacao(operacaoId);

    if (!entrada || typeof entrada.titulo !== 'string' || !entrada.titulo.trim() || entrada.titulo.trim().length > 100) {
        throw erroOperacao(422, 'Informe um título com até 100 caracteres.');
    }

    if (typeof entrada.dataHora !== 'string' || Number.isNaN(Date.parse(entrada.dataHora))) {
        throw erroOperacao(422, 'Informe a data e o horário do lembrete.');
    }

    // Permito horários antigos na transferência de anotações já existentes.
    return registrarOperacao(pedidoId, 'salvar', {
        categoria: 'lembrete',
        id: pedidoId,
        dados: {
            aparelhoId: instalacaoId,
            titulo: entrada.titulo.trim(),
            dataHora: new Date(entrada.dataHora).toISOString(),
        },
    });
}

export async function excluirLembrete(id, aparelhoId, operacaoId) {
    // Confiro a instalação dentro da transação, inclusive quando o pedido é reenviado.
    return registrarOperacao(obterIdOperacao(operacaoId), 'excluir', {
        categoria: 'lembrete',
        id: exigirId(id),
        aparelhoId: exigirId(aparelhoId),
    });
}
