import * as rotinas from '../services/rotina-servico.js';
import * as execucao from '../services/execucao-treino-servico.js';
import * as inicio from '../services/inicio-treino-servico.js';
import * as chegada from '../services/chegada-servico.js';

export async function consultarRotinas(requisicao, resposta) {
    resposta.json(await rotinas.consultarRotinas(requisicao.acesso.alunoId));
}

export async function salvarRotina(requisicao, resposta) {
    resposta.json(await rotinas.salvarPessoal(requisicao.acesso, requisicao.body));
}

export async function consultarAtivo(requisicao, resposta) {
    resposta.json(await execucao.consultarAtivo(requisicao.acesso));
}

export async function consultarTreino(requisicao, resposta) {
    resposta.json(await execucao.consultarTreino(requisicao.acesso, requisicao.params.id));
}

export async function consultarHistorico(requisicao, resposta) {
    resposta.json(await execucao.consultarHistorico(requisicao.acesso, requisicao.query.pagina));
}

export async function iniciarTreino(requisicao, resposta) {
    resposta.json(await inicio.iniciar(requisicao.acesso, requisicao.body));
}

export async function sincronizarTreino(requisicao, resposta) {
    resposta.json(await execucao.sincronizar(requisicao.acesso, requisicao.params.id, requisicao.body));
}

export async function consultarChegada(requisicao, resposta) {
    resposta.json(await chegada.consultarChegada(requisicao.acesso.alunoId));
}

export async function solicitarChegada(requisicao, resposta) {
    resposta.json(await chegada.solicitarChegada(requisicao.acesso));
}

export async function iniciarDemonstracao(requisicao, resposta) {
    resposta.json(await inicio.iniciarDemonstracao(requisicao.acesso, requisicao.body));
}

export function consultarConfiguracao(_requisicao, resposta) {
    resposta.json(inicio.consultarConfiguracao());
}
