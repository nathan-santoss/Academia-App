// Separo o login público das consultas que precisam de uma sessão válida.
// Registro os caminhos da API e a ordem das verificações. Depois da autorização, encaminho o pedido ao controlador;
// ele chama o serviço e o repositório chega ao banco. Sou usado por aplicacao.js.

import { Router } from 'express';
import * as controlador from '../controllers/acesso-controlador.js';
import { exigirSessao } from '../middlewares/autenticacao.js';
import { limitarAcesso } from '../middlewares/limitar-acesso.js';

// Preparo rotas com esta chamada. Crio um grupo de rotas do Express para manter os caminhos deste assunto no mesmo
// arquivo.
const rotas = Router();
// Registro o caminho HTTP e suas funções na ordem escrita; as verificações vêm antes do controlador.
rotas.post('/entrar', limitarAcesso, controlador.entrar);
// Registro o caminho HTTP e suas funções na ordem escrita; as verificações vêm antes do controlador.
rotas.post('/contas', limitarAcesso, controlador.criarConta);
// Confiro a sessão antes de buscar o perfil ou encerrar o acesso.
rotas.get('/perfil', exigirSessao, controlador.consultarPerfil);
// Registro o caminho HTTP e suas funções na ordem escrita; as verificações vêm antes do controlador.
rotas.post('/sair', exigirSessao, controlador.sair);

// Disponibilizo rotas como exportação principal para os outros arquivos importarem.
export default rotas;
