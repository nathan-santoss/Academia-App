import express from 'express';
import rotasFinanceiro from './routes/financeiro-rotas.js';
import rotasMedida from './routes/medida-rotas.js';
import rotasGestao from './routes/gestao-rotas.js';
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
const saltosProxy = Number(process.env.TRUST_PROXY_HOPS || 0);
if (!Number.isInteger(saltosProxy) || saltosProxy < 0 || saltosProxy > 5) {
    throw new Error('TRUST_PROXY_HOPS deve indicar de 0 a 5 proxies confiáveis.');
}
app.set('trust proxy', saltosProxy);

app.use(express.json({

    limit: '1mb',
}));

app.use(function evitarCache(_requisicao, resposta, proximo) {

    resposta.setHeader('Cache-Control', 'no-store');

    proximo();
});

app.get('/api/v1/saude', consultarSaude);

app.use('/api/v1/financeiro', rotasFinanceiro);
app.use('/api/v1/medidas', rotasMedida);
app.use('/api/v1/acesso', rotasAcesso);
app.use('/api/v1/treinos', rotasTreino);
app.use('/api/v1/exercicios', rotasExercicio);
app.use('/api/v1/equipe', rotasEquipe);

app.use('/api/v1/alunos', rotasAluno);

app.use('/api/v1', rotasGestao);
app.use('/api/v1', rotasAcademia);

app.use(function rotaNaoEncontrada(_requisicao, resposta) {

    resposta.status(404).json({

        mensagem: 'Rota não encontrada.',
    });
});

app.use(function tratarErro(erro, _requisicao, resposta, _proximo) {

    let status = 500;

    let mensagem = 'Não foi possível concluir a operação.';

    if (erro.name === 'SequelizeUniqueConstraintError' || erro.name === 'SequelizeForeignKeyConstraintError') {
        status = 409;
        mensagem = 'Os dados conflitam com um registro existente. Consulte antes de reenviar.';
    }
    if (erro.name === 'SequelizeValidationError') {
        status = 422;
        mensagem = 'Confira os dados enviados.';
    }

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

        mensagem = 'O corpo da requisição excede 1 MB.';
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
