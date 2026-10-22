import * as repositorio from '../repositories/ficha-repositorio.js';
import { exigirAlgumPapel, exigirPapel } from './equipe-servico.js';
import { salvarRascunho } from './ficha-servico.js';
import { exigirId } from '../utils/validar-id.js';
import { exigirNumero } from '../utils/validar-rotina.js';
import { obterPagina } from '../utils/validar-pagina.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function listar(acesso, alunoId, pagina) {
    exigirId(alunoId);
    await exigirAlgumPapel(acesso, ['instrutor', 'gestao']);
    return repositorio.listarPublicacoes(alunoId, obterPagina(pagina));
}

export async function restaurar(acesso, alunoId, id, entrada) {
    exigirId(alunoId);
    exigirId(id);
    await exigirPapel(acesso, 'instrutor');
    if (!entrada) {
        throw erroOperacao(422, 'Informe a revisão do rascunho e a versão atual.');
    }
    const revisao = exigirNumero(entrada.revisao, 'revisão', 0, 2147483646);
    const versaoBase = exigirNumero(entrada.versaoBase, 'versão atual', 0, 2147483646);
    const versao = await repositorio.buscarPublicacao(id);
    if (!versao || versao.alunoId !== alunoId || versao.origem !== 'recomendada') {
        throw erroOperacao(404, 'Versão recomendada não encontrada neste aluno.');
    }
    // Recupero como rascunho; a publicação continua exigindo conferência explícita do aluno.
    return salvarRascunho(acesso, alunoId, Object.assign({}, versao.conteudo, {
        revisao: revisao,
        versaoBase: versaoBase,
    }));
}
