import * as alunoServico from '../services/aluno-servico.js';

function responderResultado(resposta, resultado, statusSucesso) {

    if (resultado.erro) {

        let status = 422;

        if (resultado.erro === 'CPF_DUPLICADO') {

            status = 409;

        } else if (resultado.erro === 'NAO_ENCONTRADO') {

            status = 404;
        }

        return resposta.status(status).json({

            mensagem: resultado.mensagem,
        });
    }

    return resposta.status(statusSucesso).json(resultado);
}

export async function cadastrarAluno(requisicao, resposta) {

    if (!requisicao.is('application/json')) {

        return resposta.status(415).json({

            mensagem: 'Envie os dados no formato JSON.',
        });
    }

    const resultado = await alunoServico.cadastrarAluno(requisicao.body, requisicao.get('Idempotency-Key'));

    return responderResultado(resposta, resultado, 201);
}

export async function listarAlunos(requisicao, resposta) {

    const resultado = await alunoServico.listarAlunos(requisicao.query);

    return responderResultado(resposta, resultado, 200);
}

export async function buscarAluno(requisicao, resposta) {

    const resultado = await alunoServico.buscarAluno(requisicao.params.id);

    return responderResultado(resposta, resultado, 200);
}
