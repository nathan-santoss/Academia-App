import * as servico from '../services/evolucao-servico.js';

export async function minhaEvolucao(requisicao, resposta) {
    resposta.json(await servico.consultar(requisicao.acesso, requisicao.acesso.alunoId, requisicao.query));
}

export async function evolucaoAluno(requisicao, resposta) {
    resposta.json(await servico.consultar(requisicao.acesso, requisicao.params.alunoId, requisicao.query));
}
