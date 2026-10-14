import express from 'express';
import rotasExercicio from './routes/exercicio-rotas.js';
import rotasAluno from './routes/aluno-rotas.js';
import rotasAcademia from './routes/academia-rotas.js';
import rotasAcesso from './routes/acesso-rotas.js';
import rotasTreino from './routes/treino-rotas.js';
import rotasEquipe from './routes/equipe-rotas.js';
import { consultarSaude } from './controllers/academia-controlador.js';
import { falhaDeConexao } from './utils/falha-conexao.js';
import { mensagemFalhaBanco } from './utils/mensagem-falha-banco.js';

const app = express();

app.disable('x-powered-by');

app.use(express.json({

    limit: '128kb',
}));

app.use(function evitarCache(_requisicao, resposta, proximo) {

    resposta.setHeader('Cache-Control', 'no-store');

    proximo();
});

app.get('/api/v1/saude', consultarSaude);

app.use('/api/v1/acesso', rotasAcesso);
app.use('/api/v1/treinos', rotasTreino);
app.use('/api/v1/exercicios', rotasExercicio);
app.use('/api/v1/equipe', rotasEquipe);

app.use('/api/v1/alunos', rotasAluno);

app.use('/api/v1', rotasAcademia);

app.use(function rotaNaoEncontrada(_requisicao, resposta) {

    resposta.status(404).json({

        mensagem: 'Rota não encontrada.',
    });
});

app.use(function tratarErro(erro, _requisicao, resposta, _proximo) {

    let status = 500;

    let mensagem = 'Não foi possível concluir a operação.';

    if (erro.statusOperacao) {

        status = erro.statusOperacao;

        mensagem = erro.message;
    }

    if (falhaDeConexao(erro)) {

        status = 503;

        mensagem = 'O Neon está indisponível. Aguarde e consulte os dados antes de reenviar uma gravação.';

        console.error(mensagemFalhaBanco(erro));
    }

    if (erro.type === 'entity.parse.failed') {

        status = 400;

        mensagem = 'Envie um JSON válido.';
    }

    if (erro.type === 'entity.too.large') {

        status = 413;

        mensagem = 'O corpo da requisição excede 128 KB.';
    }

    if (erro.status === 415) {

        status = 415;

        mensagem = 'Envie JSON com codificação UTF-8.';
    }

    if (status === 500) {

        console.error(mensagemFalhaBanco(erro));
    }

    resposta.status(status).json({

        mensagem: mensagem,
    });
});

export default app;
