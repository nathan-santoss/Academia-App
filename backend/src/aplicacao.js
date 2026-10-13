// Configuro o Express, conecto as rotas e preparo as respostas básicas da API.
import express from 'express';
import rotasAluno from './routes/aluno-rotas.js';
import rotasAcademia from './routes/academia-rotas.js';

// Crio o app que reúne as configurações e as rotas da API.
const app = express();

// Omito o nome do Express nos cabeçalhos das respostas.
app.disable('x-powered-by');

// Limito o tamanho do JSON recebido antes de encaminhá-lo ao controlador.
app.use(express.json({
    limit: '32kb',
}));

// Evito que as respostas com dados pessoais sejam armazenadas em cache.
app.use(function evitarCache(_requisicao, resposta, proximo) {
    resposta.setHeader('Cache-Control', 'no-store');
    // Continuo o atendimento da requisição depois de definir o cabeçalho.
    proximo();
});

// Disponibilizo uma rota simples para conferir se a API responde.
app.get('/api/v1/saude', function consultarSaude(_requisicao, resposta) {
    resposta.json({
        mensagem: 'API disponível.',
    });
});

// Encaminho os caminhos de alunos para o arquivo responsável por essas rotas.
app.use('/api/v1/alunos', rotasAluno);
app.use('/api/v1', rotasAcademia);

// Aviso quando o endereço solicitado não corresponde a nenhuma rota acima.
app.use(function rotaNaoEncontrada(_requisicao, resposta) {
    resposta.status(404).json({
        mensagem: 'Rota não encontrada.',
    });
});

// Centralizo somente falhas de JSON e erros inesperados, sem uma classe de erro própria.
app.use(function tratarErro(erro, _requisicao, resposta, _proximo) {
    // Reservo uma resposta genérica para falhas que não possuem mensagem específica.
    let status = 500;
    let mensagem = 'Não foi possível concluir a operação.';

    // Devolvo as mensagens previstas pelos serviços sem expor falhas internas do banco.
    if (erro.statusOperacao) {
        status = erro.statusOperacao;
        mensagem = erro.message;
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
        console.error('Falha interna ao processar a requisição.');
    }

    // Entrego ao frontend o código HTTP e a mensagem escolhidos para a falha.
    resposta.status(status).json({
        mensagem: mensagem,
    });
});

export default app;
