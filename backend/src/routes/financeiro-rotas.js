import { Router } from 'express';
import { exigirSessao } from '../middlewares/autenticacao.js';
import * as controlador from '../controllers/financeiro-controlador.js';

const rotas = Router();
rotas.use(exigirSessao);
rotas.get('/situacao', controlador.minhaSituacao);
rotas.get('/pagamentos', controlador.meusPagamentos);
rotas.get('/pendencias', controlador.pendencias);
rotas.get('/alunos/:alunoId/situacao', controlador.situacaoAluno);
rotas.get('/alunos/:alunoId/pagamentos', controlador.pagamentosAluno);
rotas.post('/alunos/:alunoId/pagamentos', controlador.registrarPagamento);
rotas.post('/alunos/:alunoId/pagamentos/:id/confirmar', controlador.confirmarPagamento);
rotas.post('/alunos/:alunoId/cancelar-renovacao', controlador.cancelarRenovacao);
rotas.get('/alunos/:alunoId/beneficios', controlador.listarBeneficios);
rotas.post('/alunos/:alunoId/beneficios', controlador.concederBeneficio);
rotas.post('/alunos/:alunoId/beneficios/:id/revogar', controlador.revogarBeneficio);
export default rotas;
