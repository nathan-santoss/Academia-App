// Separo o login público das consultas que precisam de uma sessão válida.
import { Router } from 'express';
import * as controlador from '../controllers/acesso-controlador.js';
import { exigirSessao } from '../middlewares/autenticacao.js';
import { limitarAcesso } from '../middlewares/limitar-acesso.js';

const rotas = Router();
rotas.post('/entrar', limitarAcesso, controlador.entrar);
rotas.post('/contas', limitarAcesso, controlador.criarConta);
// Confiro a sessão antes de buscar o perfil ou encerrar o acesso.
rotas.get('/perfil', exigirSessao, controlador.consultarPerfil);
rotas.post('/sair', exigirSessao, controlador.sair);

export default rotas;
