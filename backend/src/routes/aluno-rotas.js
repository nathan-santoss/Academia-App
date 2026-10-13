// Relaciono cada endereço de alunos ao controlador responsável pela operação.
import { Router } from 'express';
import { cadastrarAluno, listarAlunos, buscarAluno } from '../controllers/aluno-controlador.js';
import { verificarDisponibilidadeAlunos } from '../middlewares/disponibilidade-alunos.js';

// Agrupo os endereços de alunos para conectá-los ao app em um único lugar.
const rotas = Router();

// Respeito o bloqueio temporário em produção antes de chamar os controladores.
rotas.use(verificarDisponibilidadeAlunos);

// Direciono o envio de dados ao controlador que cadastra um aluno.
rotas.post('/', cadastrarAluno);
// Associo a consulta sem ID à listagem com filtros e paginação.
rotas.get('/', listarAlunos);
// Encaminho o ID presente na URL para a consulta individual.
rotas.get('/:id', buscarAluno);

export default rotas;
