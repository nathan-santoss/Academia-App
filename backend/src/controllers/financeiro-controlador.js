import * as financeiro from '../services/financeiro-servico.js';
import * as beneficios from '../services/beneficio-servico.js';

export async function minhaSituacao(requisicao, resposta) {
    resposta.json(await financeiro.consultarSituacao(requisicao.acesso, requisicao.acesso.alunoId));
}

export async function meusPagamentos(requisicao, resposta) {
    resposta.json(await financeiro.listarPagamentos(requisicao.acesso, requisicao.acesso.alunoId, requisicao.query.pagina));
}

export async function situacaoAluno(requisicao, resposta) {
    resposta.json(await financeiro.consultarSituacao(requisicao.acesso, requisicao.params.alunoId));
}

export async function pagamentosAluno(requisicao, resposta) {
    resposta.json(await financeiro.listarPagamentos(requisicao.acesso, requisicao.params.alunoId, requisicao.query.pagina));
}

export async function registrarPagamento(requisicao, resposta) {
    resposta.status(201).json(await financeiro.registrarPagamento(requisicao.acesso, requisicao.params.alunoId, requisicao.body, requisicao.get('Idempotency-Key')));
}

export async function confirmarPagamento(requisicao, resposta) {
    resposta.json(await financeiro.confirmarPagamento(requisicao.acesso, requisicao.params.alunoId, requisicao.params.id, requisicao.get('Idempotency-Key')));
}

export async function cancelarRenovacao(requisicao, resposta) {
    resposta.json(await financeiro.cancelarRenovacao(requisicao.acesso, requisicao.params.alunoId, requisicao.get('Idempotency-Key')));
}

export async function listarBeneficios(requisicao, resposta) {
    resposta.json(await beneficios.listar(requisicao.acesso, requisicao.params.alunoId, requisicao.query.pagina));
}

export async function concederBeneficio(requisicao, resposta) {
    resposta.status(201).json(await beneficios.conceder(requisicao.acesso, requisicao.params.alunoId, requisicao.body, requisicao.get('Idempotency-Key')));
}

export async function revogarBeneficio(requisicao, resposta) {
    resposta.json(await beneficios.revogar(requisicao.acesso, requisicao.params.alunoId, requisicao.params.id, requisicao.body, requisicao.get('Idempotency-Key')));
}

export async function pendencias(requisicao, resposta) {
    resposta.json(await financeiro.consultarPendencias(requisicao.acesso));
}
