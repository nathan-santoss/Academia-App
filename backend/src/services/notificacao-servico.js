import * as repositorio from '../repositories/notificacao-repositorio.js';
import { exigirId } from '../utils/validar-id.js';
import { obterPagina } from '../utils/validar-pagina.js';

export async function notificarAluno(alunoId, evento, mensagem, destino, transacao) {
    const conta = await repositorio.buscarContaAluno(alunoId, transacao);
    if (!conta) {
        return;
    }
    await repositorio.criar({
        contaId: conta.id,
        evento: evento,
        mensagem: mensagem,
        destino: destino,
    }, transacao);
}

export function listar(acesso, pagina) {
    return repositorio.listar(acesso.contaId, obterPagina(pagina));
}

export async function marcarLida(acesso, id) {
    await repositorio.marcarLida(acesso.contaId, exigirId(id));
    return {
        mensagem: 'Leitura registrada.',
    };
}
