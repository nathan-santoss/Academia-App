import { createHash } from 'node:crypto';
import * as repositorio from '../repositories/treino-repositorio.js';
import { exigirId } from '../utils/validar-id.js';
import { exigirNumero } from '../utils/validar-rotina.js';
import { validarSeries, obterEstadoTreino } from '../utils/validar-treino.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export function consultarAtivo(acesso) {
    return repositorio.buscarTreinoAtivo(acesso.alunoId);
}

export async function consultarTreino(acesso, id) {
    exigirId(id);
    const treino = await repositorio.buscarTreino(id, acesso.alunoId);
    if (!treino) {
        throw erroOperacao(404, 'Treino não encontrado nesta conta.');
    }
    return treino;
}

export function consultarHistorico(acesso, pagina) {
    let numero = 0;
    if (pagina !== undefined) {
        numero = Number(pagina);
    }
    exigirNumero(numero, 'página', 0, 100000);
    return repositorio.listarHistorico(acesso.alunoId, numero);
}

export async function sincronizar(acesso, id, entrada) {
    exigirId(id);
    if (!entrada) {
        throw erroOperacao(422, 'Envie os registros do treino.');
    }
    const operacaoId = exigirId(entrada.operacaoId);
    const revisao = exigirNumero(entrada.revisao, 'revisão', 0, 2147483646);

    const resumo = createHash('sha256').update(JSON.stringify({
        contaId: acesso.contaId,
        treinoId: id,
        entrada: entrada,
    })).digest('hex');
    return repositorio.executarTransacao(async function registrar(transacao) {
        await repositorio.bloquearAluno(acesso.alunoId, transacao);
        const recibo = await repositorio.buscarRecibo(operacaoId, transacao);
        if (recibo) {
            if (recibo.resumo !== resumo) {
                throw erroOperacao(409, 'O identificador da operação já foi usado com outro conteúdo.');
            }
            return recibo.resultado;
        }
        const treino = await repositorio.buscarTreino(id, acesso.alunoId, transacao);
        if (!treino) {
            throw erroOperacao(404, 'Treino não encontrado nesta conta.');
        }
        if (treino.revisao !== revisao || treino.estado !== 'ativo') {
            throw erroOperacao(409, 'O treino mudou em outro aparelho ou já foi encerrado. Seu rascunho foi preservado; consulte os registros confirmados.');
        }
        const series = validarSeries(entrada.series, treino.referencia);
        const estado = obterEstadoTreino(entrada.encerrar, series, treino.referencia);
        let encerradoEm = null;
        if (estado !== 'ativo') {
            encerradoEm = new Date();
        }
        await repositorio.atualizarTreino(treino, {
            series: series,
            revisao: revisao + 1,
            estado: estado,
            encerradoEm: encerradoEm,
        }, transacao);
        const resultado = treino.toJSON();

        await repositorio.criarRecibo({
            id: operacaoId,
            resumo: resumo,
            resultado: resultado,
        }, transacao);
        return resultado;
    });
}
