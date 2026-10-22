import { Router } from 'express';
import { exigirSessao } from '../middlewares/autenticacao.js';
import * as controlador from '../controllers/medida-controlador.js';

const rotas = Router();
rotas.use(exigirSessao);
rotas.get('/', controlador.listar);
rotas.post('/', controlador.registrar);
rotas.get('/privacidade', controlador.privacidade);
rotas.put('/privacidade', controlador.salvarPrivacidade);
rotas.get('/alunos/:alunoId', controlador.listarAluno);
rotas.put('/:id', controlador.corrigir);
export default rotas;
