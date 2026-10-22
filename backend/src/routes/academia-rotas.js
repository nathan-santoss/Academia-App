import { Router } from 'express';
import * as controlador from '../controllers/academia-controlador.js';
import { exigirSessao, exigirGestao } from '../middlewares/autenticacao.js';

const rotas = Router();

rotas.use(exigirSessao);

rotas.get('/catalogo/:categoria', controlador.listarCatalogo);

rotas.put('/catalogo/:categoria/:id', exigirGestao, controlador.salvarCatalogo);

rotas.get('/lembretes', controlador.listarLembretes);

rotas.post('/lembretes', controlador.salvarLembrete);

rotas.delete('/lembretes/:id', controlador.excluirLembrete);

export default rotas;
