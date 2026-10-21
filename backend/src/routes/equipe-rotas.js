import { Router } from 'express';
import { evolucaoAluno } from '../controllers/evolucao-controlador.js';
import { exigirSessao } from '../middlewares/autenticacao.js';
import * as controlador from '../controllers/equipe-controlador.js';

import * as historico from '../controllers/historico-ficha-controlador.js';

const rotas = Router();
rotas.use(exigirSessao);
rotas.get('/chegadas', historico.consultarFila);
rotas.get('/alunos/:alunoId/ficha/versoes', historico.listar);
rotas.post('/alunos/:alunoId/ficha/versoes/:id/restaurar', historico.restaurar);
rotas.get('/alunos/:alunoId/evolucao', evolucaoAluno);
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
