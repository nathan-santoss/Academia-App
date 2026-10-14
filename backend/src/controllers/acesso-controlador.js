// Encaminho login, consulta do perfil e saída aos serviços de acesso e de aluno.
// Recebo os dados HTTP da rota, chamo o serviço do assunto e monto a resposta. Deixo as regras no serviço e as
// consultas no repositório para cada arquivo cuidar de uma etapa. Sou usado por acesso-rotas.js.

import * as acesso from '../services/acesso-servico.js';
import { buscarAluno } from '../services/aluno-servico.js';

// Recebo o formulário da rota de cadastro, chamo o serviço e respondo com 201 quando a conta é criada.
export async function criarConta(requisicao, resposta) {
    // Aceito apenas os dados validados pelo serviço, sem papéis ou permissões vindos do app.
    resposta.status(201).json(await acesso.criarConta(requisicao.body));
} // Termino criarConta e devolvo o controle a quem chamou.

// Passo e-mail e senha ao serviço e devolvo a sessão pela resposta HTTP.
export async function entrar(requisicao, resposta) {
    // Devolvo a sessão somente depois da conferência da senha. Envio estes dados em JSON e encerro o atendimento
    // desta rota.
    resposta.json(await acesso.entrar(requisicao.body));
} // Termino entrar e devolvo o controle a quem chamou.

// Uso o aluno da sessão conferida para buscar e devolver apenas o perfil da própria pessoa.
export async function consultarPerfil(requisicao, resposta) {
    // Uso o aluno identificado pela sessão; a pessoa não escolhe o ID deste pedido. Envio estes dados em JSON e
    // encerro o atendimento desta rota.
    resposta.json(await buscarAluno(requisicao.acesso.alunoId));
} // Termino consultarPerfil e devolvo o controle a quem chamou.

// Peço ao serviço que encerre a sessão já conferida e devolvo 204, sem conteúdo.
export async function sair(requisicao, resposta) {
    // Espero esta tarefa terminar antes de continuar. Chamo acesso.sair em acesso-servico.js. Nesse passo, peço ao
    // repositório que apague a sessão atual para o token deixar de permitir acesso.
    await acesso.sair(requisicao.acesso);
    // Confirmo a saída sem devolver dados pessoais ou a credencial encerrada.
    resposta.status(204).end();
} // Termino sair e devolvo o controle a quem chamou.
