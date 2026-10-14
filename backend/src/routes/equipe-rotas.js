import { Router } from 'express';
import { exigirSessao } from '../middlewares/autenticacao.js';
import * as controlador from '../controllers/equipe-controlador.js';

const rotas = Router();
rotas.use(exigirSessao);
rotas.get('/papeis', controlador.consultarPapeis);
rotas.get('/alunos', controlador.buscarAlunos);
rotas.get('/alunos/:alunoId/chegada', controlador.consultarChegada);
rotas.post('/alunos/:alunoId/excecao', controlador.autorizarExcecao);
rotas.post('/alunos/:alunoId/chegada', controlador.confirmarChegada);
rotas.get('/alunos/:alunoId/ficha', controlador.consultarFicha);
rotas.put('/alunos/:alunoId/ficha/rascunho', controlador.salvarRascunho);
rotas.post('/alunos/:alunoId/ficha/publicar', controlador.publicarFicha);
rotas.get('/alunos/:alunoId/treinos', controlador.consultarExecucoes);

export default rotas;
