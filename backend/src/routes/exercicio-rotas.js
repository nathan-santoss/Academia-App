import { Router } from 'express';
import { exigirSessao } from '../middlewares/autenticacao.js';
import * as controlador from '../controllers/exercicio-controlador.js';

const rotas = Router();
rotas.use(exigirSessao);
rotas.get('/', controlador.listar);
rotas.get('/:id', controlador.consultar);
rotas.put('/:id', controlador.salvar);

export default rotas;
