// Configuro o Express, conecto as rotas e preparo as respostas básicas da API.
import express from 'express';
import rotasAluno from './routes/aluno-rotas.js';
import rotasAcademia from './routes/academia-rotas.js';
import { consultarSaude } from './controllers/academia-controlador.js';
import { falhaDeConexao } from './utils/falha-conexao.js';
import { mensagemFalhaBanco } from './utils/mensagem-falha-banco.js';

// Crio o app que reúne as configurações e as rotas da API.
const app = express();

// Omito o nome do Express nos cabeçalhos das respostas.
app.disable('x-powered-by');

// Uso express.json para transformar o texto JSON em requisicao.body, que os controladores conseguem ler.
// Também limito o tamanho do pedido para não aceitar um corpo muito maior do que estes cadastros precisam.
app.use(express.json({
    limit: '32kb',
}));

// Evito que as respostas com dados pessoais sejam armazenadas em cache.
app.use(function evitarCache(_requisicao, resposta, proximo) {
    resposta.setHeader('Cache-Control', 'no-store');
    // Chamo proximo para o pedido continuar até a rota; sem isso, ele ficaria parado neste middleware.
    proximo();
});

// Confirmo que a API consegue consultar o Neon antes de sinalizar saúde ao Render.
app.get('/api/v1/saude', consultarSaude);

// Acrescento este prefixo aos caminhos do arquivo de rotas; o / de lá passa a atender em /api/v1/alunos.
app.use('/api/v1/alunos', rotasAluno);
app.use('/api/v1', rotasAcademia);

// Aviso quando o endereço solicitado não corresponde a nenhuma rota acima.
app.use(function rotaNaoEncontrada(_requisicao, resposta) {
    resposta.status(404).json({
        mensagem: 'Rota não encontrada.',
    });
});

// Centralizo somente falhas de JSON e erros inesperados, sem uma classe de erro própria.
// Deixo este tratamento por último para receber as falhas que vieram das rotas e dos serviços.
// Mantenho os quatro parâmetros porque é assim que o Express reconhece um middleware de erro.
app.use(function tratarErro(erro, _requisicao, resposta, _proximo) {
    // Reservo uma resposta genérica para falhas que não possuem mensagem específica.
    let status = 500;
    let mensagem = 'Não foi possível concluir a operação.';

    // Aproveito statusOperacao quando eu já preparei uma mensagem para um problema esperado, como CPF repetido.
    if (erro.statusOperacao) {
        status = erro.statusOperacao;
        mensagem = erro.message;
    }

    // Se perdi a conexão, devolvo 503 para explicar que o serviço está indisponível naquele momento.
    if (falhaDeConexao(erro)) {
        status = 503;
        mensagem = 'O Neon está indisponível. Aguarde e consulte os dados antes de reenviar uma gravação.';
        console.error(mensagemFalhaBanco(erro));
    }

    // Identifico um corpo que não pode ser interpretado como JSON.
    if (erro.type === 'entity.parse.failed') {
        status = 400;
        mensagem = 'Envie um JSON válido.';
    }

    // Informo quando o tamanho enviado ultrapassa o limite definido no app.
    if (erro.type === 'entity.too.large') {
        status = 413;
        mensagem = 'O corpo da requisição excede 32 KB.';
    }

    // Oriento o uso da codificação esperada para ler os dados corretamente.
    if (erro.status === 415) {
        status = 415;
        mensagem = 'Envie JSON com codificação UTF-8.';
    }

    // Preservo os detalhes internos do banco e mostro ao cliente apenas uma mensagem.
    if (status === 500) {
        console.error(mensagemFalhaBanco(erro));
    }

    // Uso status para escolher o código HTTP e json para entregar a mensagem que a tela vai mostrar.
    resposta.status(status).json({
        mensagem: mensagem,
    });
});

export default app;
