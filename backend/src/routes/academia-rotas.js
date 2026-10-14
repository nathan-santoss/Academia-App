// Disponibilizo as consultas e os lembretes somente para quem entrou na conta.
// Registro os caminhos da API e a ordem das verificações. Depois da autorização, encaminho o pedido ao controlador;
// ele chama o serviço e o repositório chega ao banco. Sou usado por aplicacao.js.

import { Router } from 'express';
import * as controlador from '../controllers/academia-controlador.js';
import { exigirSessao, exigirEquipe } from '../middlewares/autenticacao.js';

// Agrupo estes caminhos em um Router para depois conectar tudo à aplicação de uma vez.
const rotas = Router();
// Confiro a sessão antes de deixar qualquer controlador acessar os dados.
rotas.use(exigirSessao);
// Uso :categoria como espaço para receber plano ou modalidade pela URL.
rotas.get('/catalogo/:categoria', controlador.listarCatalogo);
// Ligo o PUT ao salvamento de um item específico; o serviço decide se ele será criado ou editado.
rotas.put('/catalogo/:categoria/:id', exigirEquipe, controlador.salvarCatalogo);
// Registro o caminho HTTP e suas funções na ordem escrita; as verificações vêm antes do controlador.
rotas.get('/lembretes', controlador.listarLembretes);
// Registro o caminho HTTP e suas funções na ordem escrita; as verificações vêm antes do controlador.
rotas.post('/lembretes', controlador.salvarLembrete);
// Reservo DELETE para excluir o lembrete cujo ID veio no caminho.
rotas.delete('/lembretes/:id', controlador.excluirLembrete);

// Disponibilizo rotas como exportação principal para os outros arquivos importarem.
export default rotas;
