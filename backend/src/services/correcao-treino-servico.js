import { executarOperacao } from './operacao-servico.js';
import { registrarAuditoria } from './auditoria-servico.js';
import * as repositorio from '../repositories/treino-repositorio.js';
import { exigirId } from '../utils/validar-id.js';
import { exigirNumero, exigirTexto } from '../utils/validar-rotina.js';
import { validarSeries, obterEstadoTreino } from '../utils/validar-treino.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function corrigir(acesso, id, entrada, operacaoId) {
    exigirId(id);
    if (!entrada) {
        throw erroOperacao(422, 'Informe a correção.');
    }
    const revisao = exigirNumero(entrada.revisao, 'revisão', 1, 2147483646);
    const motivo = exigirTexto(entrada.motivo, 'motivo da correção', 500);
    return executarOperacao(acesso, acesso.alunoId, operacaoId, 'corrigir_treino', {
        treinoId: id,
        entrada: entrada,
    }, async function salvar(transacao) {
        const treino = await repositorio.buscarTreino(id, acesso.alunoId, transacao);
        if (!treino) {
            throw erroOperacao(404, 'Treino não encontrado.');
        }
        if (treino.estado === 'ativo' || treino.revisao !== revisao) {
            throw erroOperacao(409, 'Consulte a revisão atual de um treino já encerrado.');
        }
        const series = validarSeries(entrada.series, treino.referencia);
        const anterior = treino.series;
        await repositorio.atualizarTreino(treino, {
            series: series,
            estado: obterEstadoTreino(true, series, treino.referencia),
            revisao: revisao + 1,
        }, transacao);
        await registrarAuditoria(acesso, acesso.alunoId, 'treino_corrigido', id, {
            motivo: motivo,
            anterior: anterior,
            atual: series,
        }, transacao);
        return treino;
    });
}
