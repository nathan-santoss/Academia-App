import * as repositorio from '../repositories/auditoria-repositorio.js';
import { exigirPapel } from './equipe-servico.js';
import { exigirId } from '../utils/validar-id.js';
import { obterPagina } from '../utils/validar-pagina.js';

export function registrarAuditoria(acesso, alunoId, acao, alvoId, dados, transacao) {
    return repositorio.registrar({
        atorContaId: acesso.contaId,
        alunoId: alunoId,
        acao: acao,
        alvoId: alvoId,
        dados: dados,
    }, transacao);
}

export async function listarAuditoria(acesso, consulta) {
    await exigirPapel(acesso, 'gestao');
    let alunoId = null;
    if (consulta.alunoId !== undefined) {
        alunoId = exigirId(consulta.alunoId);
    }
    return repositorio.listar(alunoId, obterPagina(consulta.pagina));
}
