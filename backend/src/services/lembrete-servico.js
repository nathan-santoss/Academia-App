// Valido os lembretes da instalação e mantenho seus registros no Neon.
import { consultarRegistros, registrarOperacao } from './persistencia-servico.js';
import { exigirId, obterIdOperacao } from '../utils/validar-id.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function listarLembretes(aparelhoId) {
    // Confiro o ID do aparelho antes de buscar os lembretes, já que ele define quais registros vou consultar.
    return consultarRegistros('lembrete', exigirId(aparelhoId));
}

export function salvarLembrete(entrada, aparelhoId, operacaoId) {
    // Valido o aparelho e preparo o ID do pedido antes de montar o registro.
    const instalacaoId = exigirId(aparelhoId);
    const pedidoId = obterIdOperacao(operacaoId);

    // Uso trim para ignorar espaços nas pontas; um título feito só de espaços não serve como lembrete.
    if (!entrada || typeof entrada.titulo !== 'string' || !entrada.titulo.trim() || entrada.titulo.trim().length > 100) {
        throw erroOperacao(422, 'Informe um título com até 100 caracteres.');
    }

    // Confiro a data antes de chamar toISOString, porque uma data inválida faria essa conversão falhar.
    if (typeof entrada.dataHora !== 'string' || Number.isNaN(Date.parse(entrada.dataHora))) {
        throw erroOperacao(422, 'Informe a data e o horário do lembrete.');
    }

    // Permito horários antigos na transferência de anotações já existentes.
    return registrarOperacao(pedidoId, 'salvar', {
        categoria: 'lembrete',
        // Uso o ID do pedido também no lembrete para reconhecer um reenvio da mesma criação.
        id: pedidoId,
        dados: {
            aparelhoId: instalacaoId,
            titulo: entrada.titulo.trim(),
            // Guardo o horário em texto ISO, para não depender do jeito que cada aparelho escreve uma data.
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
