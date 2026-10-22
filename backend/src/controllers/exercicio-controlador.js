import { salvar as salvarExercicio } from '../services/cadastro-exercicio-servico.js';
import * as servico from '../services/exercicio-servico.js';

export async function salvar(requisicao, resposta) {
    resposta.json(await salvarExercicio(requisicao.acesso, requisicao.params.id, requisicao.body));
}

export async function listar(requisicao, resposta) {
    resposta.json(await servico.listar(requisicao.query));
}

export async function consultar(requisicao, resposta) {
    resposta.json(await servico.consultar(requisicao.params.id));
}
