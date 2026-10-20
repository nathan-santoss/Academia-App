import * as funcionarios from '../services/funcionario-servico.js';
import * as modelos from '../services/modelo-treino-servico.js';
import * as auditoria from '../services/auditoria-servico.js';
import * as notificacoes from '../services/notificacao-servico.js';

export async function listarFuncionarios(requisicao, resposta) {
    resposta.json(await funcionarios.listar(requisicao.acesso, requisicao.query.pagina));
}

export async function salvarFuncionario(requisicao, resposta) {
    resposta.json(await funcionarios.salvar(requisicao.acesso, requisicao.params.contaId, requisicao.body));
}

export async function listarModelos(requisicao, resposta) {
    resposta.json(await modelos.listar(requisicao.acesso, requisicao.query.pagina));
}

export async function salvarModelo(requisicao, resposta) {
    resposta.json(await modelos.salvar(requisicao.acesso, requisicao.params.id, requisicao.body));
}

export async function listarAuditoria(requisicao, resposta) {
    resposta.json(await auditoria.listarAuditoria(requisicao.acesso, requisicao.query));
}

export async function listarNotificacoes(requisicao, resposta) {
    resposta.json(await notificacoes.listar(requisicao.acesso, requisicao.query.pagina));
}

export async function lerNotificacao(requisicao, resposta) {
    resposta.json(await notificacoes.marcarLida(requisicao.acesso, requisicao.params.id));
}
