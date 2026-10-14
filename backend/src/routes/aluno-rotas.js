// Relaciono cada endereço de alunos ao controlador responsável pela operação.
// Registro os caminhos da API e a ordem das verificações. Depois da autorização, encaminho o pedido ao controlador;
// ele chama o serviço e o repositório chega ao banco. Sou usado por aplicacao.js.

import { Router } from 'express';
import { cadastrarAluno, listarAlunos, buscarAluno } from '../controllers/aluno-controlador.js';
import { exigirSessao, exigirProprioAluno, exigirEquipe } from '../middlewares/autenticacao.js';

// Uso Router para reunir os caminhos de alunos; o prefixo /api/v1/alunos entra lá na aplicação.
const rotas = Router();

// Confiro o login antes de qualquer consulta ou mudança nos cadastros.
rotas.use(exigirSessao);

// Associo POST / ao cadastro porque esse método representa o envio de um registro novo.
rotas.post('/', exigirEquipe, cadastrarAluno);
// Associo a consulta sem ID à listagem com filtros e paginação.
rotas.get('/', exigirEquipe, listarAlunos);
// Uso :id como um espaço na URL; o Express coloca esse valor em requisicao.params.id.
rotas.get('/:id', exigirProprioAluno, buscarAluno);

// Disponibilizo rotas como exportação principal para os outros arquivos importarem.
export default rotas;
