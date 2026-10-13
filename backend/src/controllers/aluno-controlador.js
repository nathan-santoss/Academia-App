// Recebo pedidos HTTP de alunos e converto os resultados do serviço em respostas da API.
import * as alunoServico from '../services/aluno-servico.js';

function responderResultado(resposta, resultado, statusSucesso) {
    // Se o serviço trouxe um erro conhecido, eu escolho uma resposta que a tela consiga entender.
    if (resultado.erro) {
        let status = 422;

        // Diferencio um conflito de cadastro de um aluno que não foi encontrado.
        if (resultado.erro === 'CPF_DUPLICADO') {
            status = 409;
        } else if (resultado.erro === 'NAO_ENCONTRADO') {
            status = 404;
        }

        // Devolvo a mensagem do serviço com o código HTTP correspondente.
        return resposta.status(status).json({
            mensagem: resultado.mensagem,
        });
    }

    // Aproveito o resultado já preparado pelo serviço quando a operação deu certo.
    return resposta.status(statusSucesso).json(resultado);
}

export async function cadastrarAluno(requisicao, resposta) {
    // Confiro com is se o pedido foi enviado como JSON, porque é esse formato que eu espero no cadastro.
    if (!requisicao.is('application/json')) {
        return resposta.status(415).json({
            mensagem: 'Envie os dados no formato JSON.',
        });
    }

    // Pego os dados em body e espero o serviço validar e salvar; o controller só organiza esse caminho.
    const resultado = await alunoServico.cadastrarAluno(requisicao.body, requisicao.get('Idempotency-Key'));

    // Indico com 201 que um novo cadastro foi criado.
    return responderResultado(resposta, resultado, 201);
}

export async function listarAlunos(requisicao, resposta) {
    // Leio query para pegar valores depois do ?, como pagina=2 e busca=Ana.
    const resultado = await alunoServico.listarAlunos(requisicao.query);

    // Confirmo a consulta com 200 ou encaminho a mensagem de validação.
    return responderResultado(resposta, resultado, 200);
}

export async function buscarAluno(requisicao, resposta) {
    // Pego params.id do trecho /alunos/:id e deixo a busca do cadastro por conta do serviço.
    const resultado = await alunoServico.buscarAluno(requisicao.params.id);

    // Apresento os dados encontrados ou a mensagem definida pelo serviço.
    return responderResultado(resposta, resultado, 200);
}
