// Recebo os pedidos das telas da equipe e passo os dados aos serviços que conferem as regras.
// Devolvo o resultado como JSON, que o aplicativo consegue ler e mostrar na tela.
import * as equipe from '../services/equipe-servico.js';
import * as chegada from '../services/chegada-servico.js';
import * as ficha from '../services/ficha-servico.js';

export async function consultarPapeis(requisicao, resposta) {
    resposta.json(await equipe.consultarPapeis(requisicao.acesso));
}

export async function buscarAlunos(requisicao, resposta) {
    resposta.json(await equipe.buscarAlunos(requisicao.acesso, requisicao.query.busca));
}

export async function consultarChegada(requisicao, resposta) {
    await equipe.exigirPapel(requisicao.acesso, 'recepcao');
    resposta.json(await chegada.consultarChegada(requisicao.params.alunoId));
}

export async function autorizarExcecao(requisicao, resposta) {
    resposta.json(await chegada.autorizarExcecao(requisicao.acesso, requisicao.params.alunoId, requisicao.body));
}

export async function confirmarChegada(requisicao, resposta) {
    resposta.json(await chegada.confirmarChegada(requisicao.acesso, requisicao.params.alunoId));
}

export async function consultarFicha(requisicao, resposta) {
    resposta.json(await ficha.consultarFicha(requisicao.acesso, requisicao.params.alunoId));
}

export async function salvarRascunho(requisicao, resposta) {
    resposta.json(await ficha.salvarRascunho(requisicao.acesso, requisicao.params.alunoId, requisicao.body));
}

export async function publicarFicha(requisicao, resposta) {
    resposta.json(await ficha.publicarFicha(requisicao.acesso, requisicao.params.alunoId, requisicao.body));
}

export async function consultarExecucoes(requisicao, resposta) {
    // Encaminho a página escolhida, mas deixo a autorização e a validação no serviço.
    resposta.json(await ficha.consultarExecucoes(requisicao.acesso, requisicao.params.alunoId, requisicao.query.pagina));
}
