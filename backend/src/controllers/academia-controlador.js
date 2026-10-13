// Encaminho pedidos de catálogo, lembretes e sincronização aos serviços correspondentes.
import * as catalogo from '../services/catalogo-servico.js';
import * as lembretes from '../services/lembrete-servico.js';
import { estadoPersistencia, listarPendencias, sincronizar } from '../services/persistencia-servico.js';

function responderGravacao(resposta, resultado) {
    if (resultado.pendente) {
        return resposta.status(202).json(resultado);
    }

    return resposta.status(200).json(resultado);
}

export async function listarCatalogo(requisicao, resposta) {
    resposta.json(await catalogo.listarCatalogo(requisicao.params.categoria));
}

export async function salvarCatalogo(requisicao, resposta) {
    const resultado = await catalogo.salvarCatalogo(requisicao.params.categoria, requisicao.params.id,
        requisicao.body, requisicao.get('Idempotency-Key'));
    responderGravacao(resposta, resultado);
}

export async function listarLembretes(requisicao, resposta) {
    resposta.json(await lembretes.listarLembretes(requisicao.get('X-Aparelho-ID')));
}

export async function salvarLembrete(requisicao, resposta) {
    const resultado = await lembretes.salvarLembrete(requisicao.body, requisicao.get('X-Aparelho-ID'),
        requisicao.get('Idempotency-Key'));
    responderGravacao(resposta, resultado);
}

export async function excluirLembrete(requisicao, resposta) {
    const resultado = await lembretes.excluirLembrete(requisicao.params.id, requisicao.get('X-Aparelho-ID'),
        requisicao.get('Idempotency-Key'));
    responderGravacao(resposta, resultado);
}

export async function consultarSincronizacao(_requisicao, resposta) {
    resposta.json({
        dados: await estadoPersistencia(),
        pendencias: await listarPendencias(),
    });
}

export async function sincronizarAgora(_requisicao, resposta) {
    await sincronizar();
    resposta.json({
        dados: await estadoPersistencia(),
    });
}
