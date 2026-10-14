import { consultarRegistros, registrarOperacao } from './persistencia-servico.js';
import { exigirId, obterIdOperacao } from '../utils/validar-id.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function listarLembretes(contaId) {

    return consultarRegistros('lembrete', exigirId(contaId));
}

export function salvarLembrete(entrada, contaId, operacaoId) {

    const donoId = exigirId(contaId);

    const pedidoId = obterIdOperacao(operacaoId);

    if (!entrada || typeof entrada.titulo !== 'string' || !entrada.titulo.trim() || entrada.titulo.trim().length > 100) {

        throw erroOperacao(422, 'Informe um título com até 100 caracteres.');
    }

    if (typeof entrada.dataHora !== 'string' || Number.isNaN(Date.parse(entrada.dataHora))) {

        throw erroOperacao(422, 'Informe a data e o horário do lembrete.');
    }

    return registrarOperacao(pedidoId, 'salvar', {

        categoria: 'lembrete',

        id: pedidoId,

        dados: {

            contaId: donoId,

            titulo: entrada.titulo.trim(),

            dataHora: new Date(entrada.dataHora).toISOString(),
        },
    });
}

export async function excluirLembrete(id, contaId, operacaoId) {

    return registrarOperacao(obterIdOperacao(operacaoId), 'excluir', {

        categoria: 'lembrete',

        id: exigirId(id),

        contaId: exigirId(contaId),
    });
}
