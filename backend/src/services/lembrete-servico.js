// Valido os lembretes da instalação e mantenho sua persistência exclusivamente no backend.
import { consultarRegistros, registrarOperacao } from './persistencia-servico.js';
import { exigirId } from '../utils/validar-id.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function listarLembretes(aparelhoId) {
    exigirId(aparelhoId);
    const resultado = await consultarRegistros('lembrete');
    resultado.dados = resultado.dados.filter(function pertenceAoAparelho(registro) {
        return registro.aparelhoId === aparelhoId && !registro.excluido;
    });
    return resultado;
}

export function salvarLembrete(entrada, aparelhoId, operacaoId) {
    exigirId(aparelhoId);
    exigirId(operacaoId);

    if (!entrada || typeof entrada.titulo !== 'string' || !entrada.titulo.trim() || entrada.titulo.trim().length > 100) {
        throw erroOperacao(422, 'Informe um título com até 100 caracteres.');
    }

    if (typeof entrada.dataHora !== 'string' || Number.isNaN(Date.parse(entrada.dataHora))) {
        throw erroOperacao(422, 'Informe a data e o horário do lembrete.');
    }

    // Permito horários antigos na transferência de anotações já existentes, sem agendá-las novamente.
    const dados = {
        aparelhoId: aparelhoId,
        titulo: entrada.titulo.trim(),
        dataHora: new Date(entrada.dataHora).toISOString(),
    };
    return registrarOperacao(operacaoId, 'salvar', {
        categoria: 'lembrete',
        id: operacaoId,
        dados: dados,
    }, Object.assign({}, dados, {
        id: operacaoId,
    }));
}

export async function excluirLembrete(id, aparelhoId, operacaoId) {
    exigirId(id);
    exigirId(aparelhoId);
    exigirId(operacaoId);
    const resultado = await listarLembretes(aparelhoId);
    const registro = resultado.dados.find(function encontrar(lembrete) {
        return lembrete.id === id;
    });

    if (!registro) {
        throw erroOperacao(404, 'Lembrete não encontrado nesta instalação.');
    }

    return registrarOperacao(operacaoId, 'excluir', {
        categoria: 'lembrete',
        id: id,
        aparelhoId: aparelhoId,
    }, Object.assign({}, registro, {
        excluido: true,
    }));
}
