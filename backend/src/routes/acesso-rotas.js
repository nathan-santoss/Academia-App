import { Router } from 'express';
import * as controlador from '../controllers/acesso-controlador.js';
import { exigirSessao } from '../middlewares/autenticacao.js';
import { limitarAcesso, limitarOrigem } from '../middlewares/limitar-acesso.js';

const rotas = Router();

rotas.post('/entrar', limitarOrigem, limitarAcesso, controlador.entrar);

rotas.post('/contas', limitarOrigem, limitarAcesso, controlador.criarConta);

rotas.get('/perfil', exigirSessao, controlador.consultarPerfil);

rotas.post('/sair', exigirSessao, controlador.sair);

export default rotas;
