// Encaminho os pedidos de catálogo, lembretes e saúde aos serviços correspondentes.
import * as catalogo from '../services/catalogo-servico.js';
import * as lembretes from '../services/lembrete-servico.js';
import { verificarConexao } from '../services/persistencia-servico.js';

export async function consultarSaude(_requisicao, resposta) {
    await verificarConexao();
    resposta.json({
        mensagem: 'API disponível.',
    });
}

export async function listarCatalogo(requisicao, resposta) {
    resposta.json(await catalogo.listarCatalogo(requisicao.params.categoria));
}

export async function salvarCatalogo(requisicao, resposta) {
    const resultado = await catalogo.salvarCatalogo(requisicao.params.categoria, requisicao.params.id,
        requisicao.body, requisicao.get('Idempotency-Key'));
    resposta.json(resultado);
}

export async function listarLembretes(requisicao, resposta) {
    resposta.json(await lembretes.listarLembretes(requisicao.get('X-Aparelho-ID')));
}

export async function salvarLembrete(requisicao, resposta) {
    const resultado = await lembretes.salvarLembrete(requisicao.body, requisicao.get('X-Aparelho-ID'),
        requisicao.get('Idempotency-Key'));
    resposta.json(resultado);
}

export async function excluirLembrete(requisicao, resposta) {
    const resultado = await lembretes.excluirLembrete(requisicao.params.id, requisicao.get('X-Aparelho-ID'),
        requisicao.get('Idempotency-Key'));
    resposta.json(resultado);
}
