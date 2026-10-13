// Relaciono cada endereço de alunos ao controlador responsável pela operação.
import { Router } from 'express';
import { cadastrarAluno, listarAlunos, buscarAluno } from '../controllers/aluno-controlador.js';
import { verificarDisponibilidadeAlunos } from '../middlewares/disponibilidade-alunos.js';

// Uso Router para reunir os caminhos de alunos; o prefixo /api/v1/alunos entra lá na aplicação.
const rotas = Router();

// Respeito o bloqueio temporário em produção antes de chamar os controladores.
rotas.use(verificarDisponibilidadeAlunos);

// Associo POST / ao cadastro porque esse método representa o envio de um registro novo.
rotas.post('/', cadastrarAluno);
// Associo a consulta sem ID à listagem com filtros e paginação.
rotas.get('/', listarAlunos);
// Uso :id como um espaço na URL; o Express coloca esse valor em requisicao.params.id.
rotas.get('/:id', buscarAluno);

export default rotas;
