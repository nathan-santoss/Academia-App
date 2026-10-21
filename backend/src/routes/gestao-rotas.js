import { Router } from 'express';
import { exigirSessao } from '../middlewares/autenticacao.js';
import * as controlador from '../controllers/gestao-controlador.js';

import * as push from '../controllers/push-controlador.js';

const rotas = Router();
rotas.put('/notificacoes/dispositivo', exigirSessao, push.registrar);
rotas.delete('/notificacoes/dispositivo', exigirSessao, push.remover);
rotas.get('/funcionarios', exigirSessao, controlador.listarFuncionarios);
rotas.put('/funcionarios/:contaId', exigirSessao, controlador.salvarFuncionario);
rotas.get('/modelos-treino', exigirSessao, controlador.listarModelos);
rotas.put('/modelos-treino/:id', exigirSessao, controlador.salvarModelo);
rotas.get('/auditoria', exigirSessao, controlador.listarAuditoria);
rotas.get('/notificacoes', exigirSessao, controlador.listarNotificacoes);
rotas.put('/notificacoes/:id/lida', exigirSessao, controlador.lerNotificacao);
export default rotas;
