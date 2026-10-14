import banco from '../config/banco.js';
import Aluno from '../models/aluno.js';
import Rotina from '../models/rotina.js';
import Treino from '../models/treino.js';
import OperacaoRecebida from '../models/operacao-recebida.js';

export function executarTransacao(acao) {
    return banco.transaction(acao);
}

export function bloquearAluno(alunoId, transacao) {
    return Aluno.findByPk(alunoId, {
        transaction: transacao,
        lock: transacao.LOCK.UPDATE,
    });
}

export function buscarRotinaAtual(alunoId, origem, transacao) {
    return Rotina.findOne({
        where: {
            alunoId: alunoId,
            origem: origem,
        },
        order: [['versao', 'DESC']],
        transaction: transacao,
    });
}

export function criarRotina(dados, transacao) {
    return Rotina.create(dados, {
        transaction: transacao,
    });
}

export function buscarTreinoAtivo(alunoId, transacao) {
    return Treino.findOne({
        where: {
            alunoId: alunoId,
            estado: 'ativo',
        },
        transaction: transacao,
    });
}

export function buscarTreino(id, alunoId, transacao) {
    return Treino.findOne({
        where: {
            id: id,
            alunoId: alunoId,
        },
        transaction: transacao,
    });
}

export function criarTreino(dados, transacao) {
    return Treino.create(dados, {
        transaction: transacao,
    });
}

export function atualizarTreino(treino, dados, transacao) {
    return treino.update(dados, {
        transaction: transacao,
    });
}

export function listarHistorico(alunoId, pagina) {
    return Treino.findAll({
        where: {
            alunoId: alunoId,
            estado: ['completo', 'parcial'],
        },
        order: [['encerradoEm', 'DESC'], ['id', 'DESC']],
        limit: 20,
        offset: pagina * 20,
    });
}

export function buscarRecibo(id, transacao) {
    return OperacaoRecebida.findByPk(id, {
        transaction: transacao,
    });
}

export function criarRecibo(dados, transacao) {
    return OperacaoRecebida.create(dados, {
        transaction: transacao,
    });
}
