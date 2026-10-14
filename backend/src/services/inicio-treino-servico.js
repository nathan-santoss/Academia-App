import * as repositorio from '../repositories/treino-repositorio.js';
import { exigirChegada } from './chegada-servico.js';
import { exigirId } from '../utils/validar-id.js';
import { erroOperacao } from '../utils/erro-operacao.js';

async function iniciarComModo(acesso, entrada, modo) {
    if (!entrada || !['pessoal', 'recomendada'].includes(entrada.origem)) {
        throw erroOperacao(422, 'Escolha a origem da rotina.');
    }
    if (modo === 'demonstracao' && entrada.origem !== 'pessoal') {
        throw erroOperacao(422, 'A demonstração utiliza somente sua rotina pessoal.');
    }
    const id = exigirId(entrada.id);
    const rotinaId = exigirId(entrada.rotinaId);
    const divisaoId = exigirId(entrada.divisaoId);
    return repositorio.executarTransacao(async function iniciarSessao(transacao) {
        const aluno = await repositorio.bloquearAluno(acesso.alunoId, transacao);
        if (!aluno || !aluno.ativo) {
            throw erroOperacao(403, 'O cadastro do aluno está indisponível.');
        }
        const repetido = await repositorio.buscarTreino(id, acesso.alunoId, transacao);
        if (repetido) {
            let modoAnterior = 'oficial';
            if (repetido.referencia.modo) {
                modoAnterior = repetido.referencia.modo;
            }
            if (modoAnterior !== modo) {
                throw erroOperacao(409, 'Este identificador já foi usado em outro modo de treino.');
            }
            if (repetido.rotinaId !== rotinaId || repetido.referencia.divisao.id !== divisaoId || repetido.referencia.origem !== entrada.origem) {
                throw erroOperacao(409, 'Este identificador já foi usado para outro início de treino.');
            }
            return repetido;
        }
        const ativo = await repositorio.buscarTreinoAtivo(acesso.alunoId, transacao);
        if (ativo) {
            throw erroOperacao(409, 'Já existe um treino em andamento. Retome ou encerre essa sessão.');
        }
        if (modo === 'demonstracao') {
            if (process.env.DEMO_TREINOS_HABILITADO !== 'true') {
                throw erroOperacao(403, 'Novos treinos demonstrativos estão desabilitados neste ambiente.');
            }
        } else {
            await exigirChegada(acesso.alunoId, transacao);
        }
        const rotina = await repositorio.buscarRotinaAtual(acesso.alunoId, entrada.origem, transacao);
        if (!rotina || rotina.id !== rotinaId) {
            throw erroOperacao(409, 'A rotina mudou ou não está disponível. Atualize antes de iniciar.');
        }
        const divisao = rotina.conteudo.divisoes.find(function encontrar(item) {
            return item.id === divisaoId;
        });
        if (!divisao || divisao.exercicios.length === 0) {
            throw erroOperacao(422, 'Escolha uma divisão com exercícios válidos.');
        }
        return repositorio.criarTreino({
            id: id,
            alunoId: acesso.alunoId,
            rotinaId: rotina.id,
            referencia: {
                modo: modo,
                origem: rotina.origem,
                versao: rotina.versao,
                nome: rotina.conteudo.nome,
                divisao: divisao,
            },
        }, transacao);
    });
}

export function iniciar(acesso, entrada) {
    return iniciarComModo(acesso, entrada, 'oficial');
}

export function iniciarDemonstracao(acesso, entrada) {
    return iniciarComModo(acesso, entrada, 'demonstracao');
}

export function consultarConfiguracao() {
    return {
        demonstracaoHabilitada: process.env.DEMO_TREINOS_HABILITADO === 'true',
    };
}
