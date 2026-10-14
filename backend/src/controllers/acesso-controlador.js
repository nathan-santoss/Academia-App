import * as acesso from '../services/acesso-servico.js';
import { buscarAluno } from '../services/aluno-servico.js';

export async function criarConta(requisicao, resposta) {

    resposta.status(201).json(await acesso.criarConta(requisicao.body));
}

export async function entrar(requisicao, resposta) {

    resposta.json(await acesso.entrar(requisicao.body));
}

export async function consultarPerfil(requisicao, resposta) {

    resposta.json(await buscarAluno(requisicao.acesso.alunoId));
}

export async function sair(requisicao, resposta) {

    await acesso.sair(requisicao.acesso);

    resposta.status(204).end();
}
