// Disponibilizo catálogo, lembretes e sincronização mantendo o bloqueio temporário de produção.
import { Router } from 'express';
import * as controlador from '../controllers/academia-controlador.js';
import { verificarDisponibilidadeAlunos } from '../middlewares/disponibilidade-alunos.js';

const rotas = Router();
rotas.use(verificarDisponibilidadeAlunos);
rotas.get('/catalogo/:categoria', controlador.listarCatalogo);
rotas.put('/catalogo/:categoria/:id', controlador.salvarCatalogo);
rotas.get('/lembretes', controlador.listarLembretes);
rotas.post('/lembretes', controlador.salvarLembrete);
rotas.delete('/lembretes/:id', controlador.excluirLembrete);
rotas.get('/sincronizacao', controlador.consultarSincronizacao);
rotas.post('/sincronizacao', controlador.sincronizarAgora);

export default rotas;
