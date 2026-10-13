// Recebo pedidos HTTP de alunos e converto os resultados do serviço em respostas da API.
import * as alunoServico from '../services/aluno-servico.js';

function responderResultado(resposta, resultado, statusSucesso) {
    // Traduzo os problemas previstos em respostas HTTP, sem expor detalhes do banco.
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
    // Exijo JSON para que os campos do cadastro sejam lidos no formato esperado.
    if (!requisicao.is('application/json')) {
        return resposta.status(415).json({
            mensagem: 'Envie os dados no formato JSON.',
        });
    }

    // Encaminho o corpo ao serviço e devolvo o resultado do cadastro.
    const resultado = await alunoServico.cadastrarAluno(requisicao.body, requisicao.get('Idempotency-Key'));

    if (resultado.pendente) {
        return resposta.status(202).json(resultado);
    }

    // Indico com 201 que um novo cadastro foi criado.
    return responderResultado(resposta, resultado, 201);
}

export async function listarAlunos(requisicao, resposta) {
    // Passo os parâmetros da URL para a validação e a busca no serviço.
    const resultado = await alunoServico.listarAlunos(requisicao.query);

    // Confirmo a consulta com 200 ou encaminho a mensagem de validação.
    return responderResultado(resposta, resultado, 200);
}

export async function buscarAluno(requisicao, resposta) {
    // Extraio o ID do caminho; o serviço decide se o cadastro foi encontrado.
    const resultado = await alunoServico.buscarAluno(requisicao.params.id);

    // Apresento os dados encontrados ou a mensagem definida pelo serviço.
    return responderResultado(resposta, resultado, 200);
}
