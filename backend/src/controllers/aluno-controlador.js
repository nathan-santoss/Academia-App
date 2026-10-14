// Recebo pedidos HTTP de alunos e converto os resultados do serviço em respostas da API.
// Recebo os dados HTTP da rota e passo as regras para aluno-servico.js. A consulta individual só chega aqui depois da
// conferência do dono; cadastro pela equipe e listagem geral continuam bloqueados pela autorização atual.

import * as alunoServico from '../services/aluno-servico.js';

// Transformo o resultado em resposta HTTP; aqui também reconheço o formato com resultado.erro, enquanto erros
// lançados seguem para o tratamento do Express.
function responderResultado(resposta, resultado, statusSucesso) {
    // Se o serviço trouxe um erro conhecido, eu escolho uma resposta que a tela consiga entender.
    if (resultado.erro) {
        // Inicio status com 422; vou ajustar esse valor conforme as condições abaixo.
        let status = 422;

        // Diferencio um conflito de cadastro de um aluno que não foi encontrado.
        if (resultado.erro === 'CPF_DUPLICADO') {
            // Atualizo status com 409.
            status = 409;
        // Confiro se resultado.erro é igual ao texto "NAO_ENCONTRADO" antes de executar o bloco abaixo.
        } else if (resultado.erro === 'NAO_ENCONTRADO') {
            // Atualizo status com 404.
            status = 404;
        } // Encerro a conferência de resultado.erro.

        // Devolvo a mensagem do serviço com o código HTTP correspondente. Envio estes dados em JSON e encerro o
        // atendimento desta rota.
        return resposta.status(status).json({
            // Escolho a mensagem que será entregue a quem chamou este trecho.
            mensagem: resultado.mensagem,
        }); // Concluo este objeto com os campos que a etapa atual precisa.
    } // Encerro a conferência de resultado.erro.

    // Aproveito o resultado já preparado pelo serviço quando a operação deu certo. Envio estes dados em JSON e
    // encerro o atendimento desta rota.
    return resposta.status(statusSucesso).json(resultado);
} // Termino responderResultado e devolvo o controle a quem chamou.

// Recebo os campos e o ID do pedido, chamo o serviço de aluno e respondo depois da gravação.
export async function cadastrarAluno(requisicao, resposta) {
    // Confiro com is se o pedido foi enviado como JSON, porque é esse formato que eu espero no cadastro.
    if (!requisicao.is('application/json')) {
        // Devolvo o resultado desta chamada a quem pediu esta etapa. Envio estes dados em JSON e encerro o
        // atendimento desta rota.
        return resposta.status(415).json({
            // Escolho a mensagem que será entregue a quem chamou este trecho.
            mensagem: 'Envie os dados no formato JSON.',
        }); // Concluo este objeto com os campos que a etapa atual precisa.
    } // Encerro a conferência de requisicao.is.

    // Pego os dados em body e espero o serviço validar e salvar; o controller só organiza esse caminho.
    const resultado = await alunoServico.cadastrarAluno(requisicao.body, requisicao.get('Idempotency-Key'));

    // Indico com 201 que um novo cadastro foi criado.
    return responderResultado(resposta, resultado, 201);
} // Termino cadastrarAluno e devolvo o controle a quem chamou.

// Leio os filtros da URL, peço a listagem ao serviço e transformo seu resultado em resposta HTTP.
export async function listarAlunos(requisicao, resposta) {
    // Leio query para pegar valores depois do ?, como pagina=2 e busca=Ana.
    const resultado = await alunoServico.listarAlunos(requisicao.query);

    // Confirmo a consulta com 200 ou encaminho a mensagem de validação.
    return responderResultado(resposta, resultado, 200);
} // Termino listarAlunos e devolvo o controle a quem chamou.

// Leio o ID da URL já protegido pela rota, chamo o serviço e envio a resposta HTTP.
export async function buscarAluno(requisicao, resposta) {
    // Pego params.id do trecho /alunos/:id e deixo a busca do cadastro por conta do serviço.
    const resultado = await alunoServico.buscarAluno(requisicao.params.id);

    // Apresento os dados encontrados ou a mensagem definida pelo serviço.
    return responderResultado(resposta, resultado, 200);
} // Termino buscarAluno e devolvo o controle a quem chamou.
