import * as historico from '../services/historico-ficha-servico.js';
import * as fila from '../services/fila-chegada-servico.js';

export async function listar(requisicao, resposta) {
    resposta.json(await historico.listar(requisicao.acesso, requisicao.params.alunoId, requisicao.query.pagina));
}

export async function restaurar(requisicao, resposta) {
    resposta.json(await historico.restaurar(requisicao.acesso, requisicao.params.alunoId, requisicao.params.id, requisicao.body));
}

export async function consultarFila(requisicao, resposta) {
    resposta.json(await fila.consultar(requisicao.acesso, requisicao.query.pagina));
}
