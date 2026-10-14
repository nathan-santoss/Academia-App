import { randomUUID } from 'node:crypto';
import * as fichas from '../repositories/ficha-repositorio.js';
import * as treinos from '../repositories/treino-repositorio.js';
import { exigirPapel } from './equipe-servico.js';
import { exigirId } from '../utils/validar-id.js';
import { exigirNumero, validarRotina } from '../utils/validar-rotina.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function consultarFicha(acesso, alunoId) {
    exigirId(alunoId);
    await exigirPapel(acesso, 'instrutor');
    return {
        publicada: await treinos.buscarRotinaAtual(alunoId, 'recomendada'),
        rascunho: await fichas.buscarRascunho(alunoId, acesso.contaId),
    };
}

export async function salvarRascunho(acesso, alunoId, entrada) {
    exigirId(alunoId);
    await exigirPapel(acesso, 'instrutor');
    const conteudo = validarRotina(entrada);
    const revisao = exigirNumero(entrada.revisao, 'revisão do rascunho', 0, 2147483646);
    const versaoBase = exigirNumero(entrada.versaoBase, 'versão publicada', 0, 2147483646);
    return treinos.executarTransacao(async function salvar(transacao) {
        const aluno = await treinos.bloquearAluno(alunoId, transacao);
        if (!aluno || !aluno.ativo) {
            throw erroOperacao(404, 'Aluno ativo não encontrado.');
        }
        const atual = await fichas.buscarRascunho(alunoId, acesso.contaId, transacao);
        if (atual && atual.revisao !== revisao || !atual && revisao !== 0) {
            throw erroOperacao(409, 'O rascunho mudou em outro aparelho. Consulte novamente.');
        }
        const dados = {
            conteudo: conteudo,
            revisao: revisao + 1,
            versaoBase: versaoBase,
            publicadaId: null,
        };
        if (atual) {
            return fichas.atualizarRascunho(atual, dados, transacao);
        }
        return fichas.criarRascunho(Object.assign({}, dados, {
            id: randomUUID(),
            alunoId: alunoId,
            contaId: acesso.contaId,
        }), transacao);
    });
}

export async function publicarFicha(acesso, alunoId, entrada) {
    exigirId(alunoId);
    await exigirPapel(acesso, 'instrutor');
    if (!entrada || entrada.confirmarAlunoId !== alunoId) {
        throw erroOperacao(422, 'Confirme a identidade do aluno antes de publicar.');
    }
    const revisao = exigirNumero(entrada.revisao, 'revisão', 1, 2147483646);
    return treinos.executarTransacao(async function publicar(transacao) {
        const aluno = await treinos.bloquearAluno(alunoId, transacao);
        if (!aluno || !aluno.ativo) {
            throw erroOperacao(404, 'Aluno ativo não encontrado.');
        }
        const rascunho = await fichas.buscarRascunho(alunoId, acesso.contaId, transacao);
        if (!rascunho || rascunho.revisao !== revisao) {
            throw erroOperacao(409, 'Salve e confira o rascunho atual antes de publicar.');
        }
        if (rascunho.publicadaId) {
            return fichas.buscarPublicacao(rascunho.publicadaId, transacao);
        }
        const atual = await treinos.buscarRotinaAtual(alunoId, 'recomendada', transacao);
        let versao = 0;
        if (atual) {
            versao = atual.versao;
        }
        if (rascunho.versaoBase !== versao) {
            throw erroOperacao(409, 'Outro instrutor publicou uma ficha. Compare a versão atual e prepare um novo rascunho.');
        }
        const publicada = await treinos.criarRotina({
            id: randomUUID(),
            alunoId: alunoId,
            origem: 'recomendada',
            versao: versao + 1,
            autorContaId: acesso.contaId,
            conteudo: rascunho.conteudo,
        }, transacao);
        await fichas.atualizarRascunho(rascunho, {
            publicadaId: publicada.id,
        }, transacao);
        return publicada;
    });
}

export async function consultarExecucoes(acesso, alunoId, pagina) {
    exigirId(alunoId);
    await exigirPapel(acesso, 'instrutor');

    let numero = 0;
    if (pagina !== undefined) {
        numero = Number(pagina);
    }

    exigirNumero(numero, 'página', 0, 100000);
    return treinos.listarHistorico(alunoId, numero);
}
