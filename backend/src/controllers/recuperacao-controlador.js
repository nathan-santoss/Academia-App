import * as servico from '../services/recuperacao-servico.js';

export async function solicitar(requisicao, resposta) {
    resposta.json(await servico.solicitar(requisicao.body));
}

export async function redefinir(requisicao, resposta) {
    resposta.json(await servico.redefinir(requisicao.body));
}
