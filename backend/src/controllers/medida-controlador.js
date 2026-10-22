import * as servico from '../services/medida-servico.js';

export async function listar(requisicao, resposta) {
    resposta.json(await servico.listar(requisicao.acesso, requisicao.acesso.alunoId, requisicao.query.pagina));
}

export async function listarAluno(requisicao, resposta) {
    resposta.json(await servico.listar(requisicao.acesso, requisicao.params.alunoId, requisicao.query.pagina));
}

export async function privacidade(requisicao, resposta) {
    resposta.json(await servico.consultarPrivacidade(requisicao.acesso));
}

export async function salvarPrivacidade(requisicao, resposta) {
    resposta.json(await servico.salvarPrivacidade(requisicao.acesso, requisicao.body, requisicao.get('Idempotency-Key')));
}

export async function registrar(requisicao, resposta) {
    resposta.status(201).json(await servico.registrar(requisicao.acesso, requisicao.body, requisicao.get('Idempotency-Key')));
}

export async function corrigir(requisicao, resposta) {
    resposta.json(await servico.corrigir(requisicao.acesso, requisicao.params.id, requisicao.body, requisicao.get('Idempotency-Key')));
}
