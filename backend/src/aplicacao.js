// Configuro o Express, conecto as rotas e preparo as respostas básicas da API.
// Sigo esta ordem em cada pedido: leio o JSON, passo pela rota e deixo o controlador chamar o serviço. Se alguma
// etapa lançar um erro, chego ao tratamento no fim deste arquivo; um caminho sem rota recebe 404.

import express from 'express';
import rotasAluno from './routes/aluno-rotas.js';
import rotasAcademia from './routes/academia-rotas.js';
import rotasAcesso from './routes/acesso-rotas.js';
import rotasTreino from './routes/treino-rotas.js';
import rotasEquipe from './routes/equipe-rotas.js';
import { consultarSaude } from './controllers/academia-controlador.js';
import { falhaDeConexao } from './utils/falha-conexao.js';
import { mensagemFalhaBanco } from './utils/mensagem-falha-banco.js';

// Crio o app que reúne as configurações e as rotas da API.
const app = express();

// Omito o nome do Express nos cabeçalhos das respostas.
app.disable('x-powered-by');

// Uso express.json para transformar o texto JSON em requisicao.body, que os controladores conseguem ler. Também
// limito o tamanho do pedido para não aceitar um corpo muito maior do que estes cadastros precisam.
app.use(express.json({
    // Defino o limite desta operação conforme a configuração ao redor deste campo.
    limit: '128kb',
})); // Concluo este objeto com os campos que a etapa atual precisa.

// Evito que as respostas com dados pessoais sejam armazenadas em cache.
app.use(function evitarCache(_requisicao, resposta, proximo) {
    // Defino este cabeçalho da resposta antes de enviar seus dados.
    resposta.setHeader('Cache-Control', 'no-store');
    // Chamo proximo para o pedido continuar até a rota; sem isso, ele ficaria parado neste middleware.
    proximo();
}); // Termino evitarCache e devolvo o controle a quem chamou.

// Confirmo que a API consegue consultar o Neon antes de sinalizar saúde ao Render.
app.get('/api/v1/saude', consultarSaude);
// Disponibilizo o login antes das rotas protegidas por sessão.
app.use('/api/v1/acesso', rotasAcesso);
app.use('/api/v1/treinos', rotasTreino);
app.use('/api/v1/equipe', rotasEquipe);

// Acrescento este prefixo aos caminhos do arquivo de rotas; o / de lá passa a atender em /api/v1/alunos.
app.use('/api/v1/alunos', rotasAluno);
// Acrescento esta etapa à sequência do Express; o pedido passa por ela antes das próximas.
app.use('/api/v1', rotasAcademia);

// Aviso quando o endereço solicitado não corresponde a nenhuma rota acima.
app.use(function rotaNaoEncontrada(_requisicao, resposta) {
    // Envio estes dados em JSON e encerro o atendimento desta rota.
    resposta.status(404).json({
        // Escolho a mensagem que será entregue a quem chamou este trecho.
        mensagem: 'Rota não encontrada.',
    }); // Concluo este objeto com os campos que a etapa atual precisa.
}); // Termino rotaNaoEncontrada e devolvo o controle a quem chamou.

// Centralizo somente falhas de JSON e erros inesperados, sem uma classe de erro própria. Deixo este tratamento por
// último para receber as falhas que vieram das rotas e dos serviços. Mantenho os quatro parâmetros porque é assim que
// o Express reconhece um middleware de erro.
app.use(function tratarErro(erro, _requisicao, resposta, _proximo) {
    // Reservo uma resposta genérica para falhas que não possuem mensagem específica.
    let status = 500;
    // Inicio mensagem com o texto "Não foi possível concluir a operação."; vou ajustar esse valor conforme as
    // condições abaixo.
    let mensagem = 'Não foi possível concluir a operação.';

    // Aproveito statusOperacao quando eu já preparei uma mensagem para um problema esperado, como CPF repetido.
    if (erro.statusOperacao) {
        // Atualizo status com erro.statusOperacao.
        status = erro.statusOperacao;
        // Atualizo mensagem com erro.message.
        mensagem = erro.message;
    } // Encerro a conferência de erro.statusOperacao.

    // Se perdi a conexão, devolvo 503 para explicar que o serviço está indisponível naquele momento.
    if (falhaDeConexao(erro)) {
        // Atualizo status com 503.
        status = 503;
        // Atualizo mensagem com a mensagem escrita nesta linha.
        mensagem = 'O Neon está indisponível. Aguarde e consulte os dados antes de reenviar uma gravação.';
        // Registro esta orientação no terminal para ajudar a localizar a falha.
        console.error(mensagemFalhaBanco(erro));
    } // Encerro a conferência de falhaDeConexao.

    // Identifico um corpo que não pode ser interpretado como JSON.
    if (erro.type === 'entity.parse.failed') {
        // Atualizo status com 400.
        status = 400;
        // Atualizo mensagem com o texto "Envie um JSON válido.".
        mensagem = 'Envie um JSON válido.';
    } // Encerro a conferência de erro.type.

    // Informo quando o tamanho enviado ultrapassa o limite definido no app.
    if (erro.type === 'entity.too.large') {
        // Atualizo status com 413.
        status = 413;
        // Informo o limite do lote sem aceitar um corpo maior que o configurado na API.
        mensagem = 'O corpo da requisição excede 128 KB.';
    } // Encerro a conferência de erro.type.

    // Oriento o uso da codificação esperada para ler os dados corretamente.
    if (erro.status === 415) {
        // Atualizo status com 415.
        status = 415;
        // Atualizo mensagem com o texto "Envie JSON com codificação UTF-8.".
        mensagem = 'Envie JSON com codificação UTF-8.';
    } // Encerro a conferência de erro.status.

    // Preservo os detalhes internos do banco e mostro ao cliente apenas uma mensagem.
    if (status === 500) {
        // Registro esta orientação no terminal para ajudar a localizar a falha.
        console.error(mensagemFalhaBanco(erro));
    } // Encerro a conferência de status.

    // Uso status para escolher o código HTTP e json para entregar a mensagem que a tela vai mostrar. Envio estes
    // dados em JSON e encerro o atendimento desta rota.
    resposta.status(status).json({
        // Escolho a mensagem que será entregue a quem chamou este trecho.
        mensagem: mensagem,
    }); // Concluo este objeto com os campos que a etapa atual precisa.
}); // Termino tratarErro e devolvo o controle a quem chamou.

// Disponibilizo app como exportação principal para os outros arquivos importarem.
export default app;
