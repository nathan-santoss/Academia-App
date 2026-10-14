import { Router } from 'express';
import { cadastrarAluno, listarAlunos, buscarAluno } from '../controllers/aluno-controlador.js';
import { exigirSessao, exigirProprioAluno, exigirEquipe } from '../middlewares/autenticacao.js';

const rotas = Router();

rotas.use(exigirSessao);

rotas.post('/', exigirEquipe, cadastrarAluno);

rotas.get('/', exigirEquipe, listarAlunos);

rotas.get('/:id', exigirProprioAluno, buscarAluno);

export default rotas;
