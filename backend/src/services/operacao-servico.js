import * as repositorio from '../repositories/treino-repositorio.js';
import { exigirId } from '../utils/validar-id.js';
import { resumirOperacao } from '../utils/resumir-operacao.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export function executarOperacao(acesso, alunoId, id, acao, entrada, executar) {
    exigirId(id);
    exigirId(alunoId);
    const resumo = resumirOperacao({
        contaId: acesso.contaId,
        alunoId: alunoId,
        acao: acao,
        entrada: entrada,
    });
    return repositorio.executarTransacao(async function registrar(transacao) {
        await repositorio.bloquearOperacao(id, transacao);
        const aluno = await repositorio.bloquearAluno(alunoId, transacao);
        if (!aluno || !aluno.ativo) {
            throw erroOperacao(404, 'Aluno ativo não encontrado.');
        }
        const recibo = await repositorio.buscarRecibo(id, transacao);
        if (recibo) {
            if (recibo.resumo !== resumo) {
                throw erroOperacao(409, 'Esta chave de operação já foi usada com outros dados.');
            }
            return recibo.resultado;
        }
        // Gravo o recibo na mesma transação para um reenvio nunca repetir os efeitos.
        const resultado = await executar(transacao);
        const confirmado = JSON.parse(JSON.stringify(resultado));
        await repositorio.criarRecibo({
            id: id,
            resumo: resumo,
            resultado: confirmado,
        }, transacao);
        return confirmado;
    });
}
