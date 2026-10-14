// Encaminho login, consulta do perfil e saída aos serviços de acesso e de aluno.
import * as acesso from '../services/acesso-servico.js';
import { buscarAluno } from '../services/aluno-servico.js';

export async function criarConta(requisicao, resposta) {
    // Aceito apenas os dados validados pelo serviço, sem papéis ou permissões vindos do app.
    resposta.status(201).json(await acesso.criarConta(requisicao.body));
}

export async function entrar(requisicao, resposta) {
    // Devolvo a sessão somente depois da conferência da senha.
    resposta.json(await acesso.entrar(requisicao.body));
}

export async function consultarPerfil(requisicao, resposta) {
    // Uso o aluno identificado pela sessão; a pessoa não escolhe o ID deste pedido.
    resposta.json(await buscarAluno(requisicao.acesso.alunoId));
}

export async function sair(requisicao, resposta) {
    await acesso.sair(requisicao.acesso);
    // Confirmo a saída sem devolver dados pessoais ou a credencial encerrada.
    resposta.status(204).end();
}
