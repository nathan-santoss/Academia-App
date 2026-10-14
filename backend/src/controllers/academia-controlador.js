// Encaminho os pedidos de catálogo, lembretes e saúde aos serviços correspondentes.
import * as catalogo from '../services/catalogo-servico.js';
import * as lembretes from '../services/lembrete-servico.js';
import { verificarConexao } from '../services/persistencia-servico.js';

export async function consultarSaude(_requisicao, resposta) {
    // Espero a checagem do Neon antes de responder, para o Render não receber um sinal de saúde enganoso.
    await verificarConexao();
    resposta.json({
        mensagem: 'API disponível.',
    });
}

export async function listarCatalogo(requisicao, resposta) {
    // Pego a categoria que veio na URL e deixo o serviço decidir se ela é válida.
    resposta.json(await catalogo.listarCatalogo(requisicao.params.categoria));
}

export async function salvarCatalogo(requisicao, resposta) {
    // Leio o corpo em body e os identificadores em params; o serviço cuida das regras desses valores.
    // Também passo a Idempotency-Key, quando ela veio, para reconhecer uma repetição do mesmo pedido.
    const resultado = await catalogo.salvarCatalogo(requisicao.params.categoria, requisicao.params.id,
        requisicao.body, requisicao.get('Idempotency-Key'));
    resposta.json(resultado);
}

export async function listarLembretes(requisicao, resposta) {
    // Uso a conta conferida pelo login para buscar apenas os lembretes dela.
    resposta.json(await lembretes.listarLembretes(requisicao.acesso.contaId));
}

export async function salvarLembrete(requisicao, resposta) {
    // Espero o serviço salvar antes de responder, porque eu só quero confirmar o que chegou ao Neon.
    const resultado = await lembretes.salvarLembrete(requisicao.body, requisicao.acesso.contaId,
        requisicao.get('Idempotency-Key'));
    resposta.json(resultado);
}

export async function excluirLembrete(requisicao, resposta) {
    // Encaminho o ID junto com a conta; o repositório confere o dono antes de excluir.
    const resultado = await lembretes.excluirLembrete(requisicao.params.id, requisicao.acesso.contaId,
        requisicao.get('Idempotency-Key'));
    resposta.json(resultado);
}
