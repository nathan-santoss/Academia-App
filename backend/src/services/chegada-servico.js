import { randomUUID } from 'node:crypto';
import * as repositorio from '../repositories/equipe-repositorio.js';
import { executarTransacao, bloquearAluno } from '../repositories/treino-repositorio.js';
import { exigirPapel } from './equipe-servico.js';
import { diaAcademia } from '../utils/dia-academia.js';
import { exigirId } from '../utils/validar-id.js';
import { exigirTexto } from '../utils/validar-rotina.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export function consultarChegada(alunoId) {
    exigirId(alunoId);
    return repositorio.buscarChegada(alunoId, diaAcademia());
}

export async function solicitarChegada(acesso) {
    return executarTransacao(async function solicitar(transacao) {
        await bloquearAluno(acesso.alunoId, transacao);
        const dia = diaAcademia();
        const chegada = await repositorio.buscarChegada(acesso.alunoId, dia, transacao);
        if (chegada) {
            return chegada;
        }
        return repositorio.criarChegada({
            id: randomUUID(),
            alunoId: acesso.alunoId,
            dia: dia,
        }, transacao);
    });
}

export async function autorizarExcecao(acesso, alunoId, entrada) {
    exigirId(alunoId);
    const motivo = exigirTexto(entrada && entrada.motivo, 'motivo da exceção', 500);
    await exigirPapel(acesso, 'gestao');
    return executarTransacao(async function autorizar(transacao) {
        const aluno = await bloquearAluno(alunoId, transacao);
        if (!aluno || !aluno.ativo) {
            throw erroOperacao(404, 'Aluno ativo não encontrado.');
        }
        const dia = diaAcademia();
        let chegada = await repositorio.buscarChegada(alunoId, dia, transacao);
        if (!chegada) {
            chegada = await repositorio.criarChegada({
                id: randomUUID(),
                alunoId: alunoId,
                dia: dia,
            }, transacao);
        }
        if (chegada.autorizadaPor) {
            return chegada;
        }
        return repositorio.atualizarChegada(chegada, {
            autorizadaPor: acesso.contaId,
            autorizadaEm: new Date(),
            motivo: motivo,
        }, transacao);
    });
}

export async function confirmarChegada(acesso, alunoId) {
    exigirId(alunoId);
    await exigirPapel(acesso, 'recepcao');
    return executarTransacao(async function confirmar(transacao) {

        const aluno = await bloquearAluno(alunoId, transacao);
        if (!aluno || !aluno.ativo) {
            throw erroOperacao(404, 'Aluno ativo não encontrado.');
        }
        const chegada = await repositorio.buscarChegada(alunoId, diaAcademia(), transacao);
        if (!chegada || !chegada.autorizadaPor) {
            throw erroOperacao(403, 'Sem cobertura implementada, a entrada exige uma exceção diária autorizada pela Gestão.');
        }
        if (chegada.confirmadaEm) {
            return chegada;
        }
        return repositorio.atualizarChegada(chegada, {
            confirmadaPor: acesso.contaId,
            confirmadaEm: new Date(),
        }, transacao);
    });
}

export async function exigirChegada(alunoId, transacao) {
    const chegada = await repositorio.buscarChegada(alunoId, diaAcademia(), transacao);
    if (!chegada || !chegada.confirmadaEm) {
        throw erroOperacao(403, 'Peça à recepção a confirmação presencial da chegada de hoje antes de iniciar.');
    }
}
