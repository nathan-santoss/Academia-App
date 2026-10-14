// Encaminho os pedidos de catálogo, lembretes e saúde aos serviços correspondentes.
// Recebo os dados HTTP da rota, chamo o serviço do assunto e monto a resposta. Deixo as regras no serviço e as
// consultas no repositório para cada arquivo cuidar de uma etapa. Sou usado por aplicacao.js, academia-rotas.js.

import * as catalogo from '../services/catalogo-servico.js';
import * as lembretes from '../services/lembrete-servico.js';
import { verificarConexao } from '../services/persistencia-servico.js';

// Confiro o acesso ao banco e devolvo uma resposta curta para verificar se a API pode atender.
export async function consultarSaude(_requisicao, resposta) {
    // Espero a checagem do Neon antes de responder, para o Render não receber um sinal de saúde enganoso.
    await verificarConexao();
    // Envio estes dados em JSON e encerro o atendimento desta rota.
    resposta.json({
        // Escolho a mensagem que será entregue a quem chamou este trecho.
        mensagem: 'API disponível.',
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino consultarSaude e devolvo o controle a quem chamou.

// Organizo os dados do pedido para a consulta do catálogo, chamo o serviço e envio o resultado em JSON.
export async function listarCatalogo(requisicao, resposta) {
    // Pego a categoria que veio na URL e deixo o serviço decidir se ela é válida. Envio estes dados em JSON e encerro
    // o atendimento desta rota.
    resposta.json(await catalogo.listarCatalogo(requisicao.params.categoria));
} // Termino listarCatalogo e devolvo o controle a quem chamou.

// Organizo os dados do pedido para a gravação do catálogo, chamo o serviço e envio o resultado em JSON.
export async function salvarCatalogo(requisicao, resposta) {
    // Leio o corpo em body e os identificadores em params; o serviço cuida das regras desses valores. Também passo a
    // Idempotency-Key, quando ela veio, para reconhecer uma repetição do mesmo pedido.
    const resultado = await catalogo.salvarCatalogo(requisicao.params.categoria, requisicao.params.id,
        // Passo o corpo recebido e leio o cabeçalho Idempotency-Key para o serviço reconhecer um reenvio deste
        // pedido.
        requisicao.body, requisicao.get('Idempotency-Key'));
    // Envio estes dados em JSON e encerro o atendimento desta rota.
    resposta.json(resultado);
} // Termino salvarCatalogo e devolvo o controle a quem chamou.

// Organizo os dados do pedido para a consulta dos lembretes da conta, chamo o serviço e envio o resultado em JSON.
export async function listarLembretes(requisicao, resposta) {
    // Uso a conta conferida pelo login para buscar apenas os lembretes dela. Envio estes dados em JSON e encerro o
    // atendimento desta rota.
    resposta.json(await lembretes.listarLembretes(requisicao.acesso.contaId));
} // Termino listarLembretes e devolvo o controle a quem chamou.

// Organizo os dados do pedido para a gravação do lembrete da conta, chamo o serviço e envio o resultado em JSON.
export async function salvarLembrete(requisicao, resposta) {
    // Espero o serviço salvar antes de responder, porque eu só quero confirmar o que chegou ao Neon.
    const resultado = await lembretes.salvarLembrete(requisicao.body, requisicao.acesso.contaId,
        // Completo a chamada com o identificador do pedido; get lê o cabeçalho HTTP, não faz outra requisição.
        requisicao.get('Idempotency-Key'));
    // Envio estes dados em JSON e encerro o atendimento desta rota.
    resposta.json(resultado);
} // Termino salvarLembrete e devolvo o controle a quem chamou.

// Organizo os dados do pedido para a exclusão do lembrete da conta, chamo o serviço e envio o resultado em JSON.
export async function excluirLembrete(requisicao, resposta) {
    // Encaminho o ID junto com a conta; o repositório confere o dono antes de excluir.
    const resultado = await lembretes.excluirLembrete(requisicao.params.id, requisicao.acesso.contaId,
        // Completo a chamada com o identificador do pedido; get lê o cabeçalho HTTP, não faz outra requisição.
        requisicao.get('Idempotency-Key'));
    // Envio estes dados em JSON e encerro o atendimento desta rota.
    resposta.json(resultado);
} // Termino excluirLembrete e devolvo o controle a quem chamou.
