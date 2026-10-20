import * as servico from '../services/push-servico.js';

export async function registrar(requisicao, resposta) {
    resposta.json(await servico.registrar(requisicao.acesso, requisicao.body));
}

export async function remover(requisicao, resposta) {
    resposta.json(await servico.remover(requisicao.acesso, requisicao.body));
}
