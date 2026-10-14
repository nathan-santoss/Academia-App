import { Router } from 'express';
import { exigirSessao } from '../middlewares/autenticacao.js';
import * as controlador from '../controllers/treino-controlador.js';

const rotas = Router();
rotas.use(exigirSessao);
rotas.get('/rotinas', controlador.consultarRotinas);
rotas.put('/rotinas/pessoal', controlador.salvarRotina);
rotas.get('/ativo', controlador.consultarAtivo);
rotas.get('/historico', controlador.consultarHistorico);
rotas.get('/chegada', controlador.consultarChegada);
rotas.post('/chegada', controlador.solicitarChegada);
rotas.post('/', controlador.iniciarTreino);
rotas.get('/:id', controlador.consultarTreino);
rotas.put('/:id', controlador.sincronizarTreino);

export default rotas;
