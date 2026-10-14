import * as servico from '../services/exercicio-servico.js';

export async function listar(requisicao, resposta) {
    resposta.json(await servico.listar(requisicao.query));
}

export async function consultar(requisicao, resposta) {
    resposta.json(await servico.consultar(requisicao.params.id));
}
