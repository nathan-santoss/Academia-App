import * as repositorio from '../repositories/treino-repositorio.js';
import { exigirChegada } from './chegada-servico.js';
import { exigirId } from '../utils/validar-id.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function iniciar(acesso, entrada) {
    if (!entrada || !['pessoal', 'recomendada'].includes(entrada.origem)) {
        throw erroOperacao(422, 'Escolha a origem da rotina.');
    }
    const id = exigirId(entrada.id);
    const rotinaId = exigirId(entrada.rotinaId);
    const divisaoId = exigirId(entrada.divisaoId);
    return repositorio.executarTransacao(async function iniciarSessao(transacao) {
        await repositorio.bloquearAluno(acesso.alunoId, transacao);
        const repetido = await repositorio.buscarTreino(id, acesso.alunoId, transacao);
        if (repetido) {
            if (repetido.rotinaId !== rotinaId || repetido.referencia.divisao.id !== divisaoId || repetido.referencia.origem !== entrada.origem) {
                throw erroOperacao(409, 'Este identificador já foi usado para outro início de treino.');
            }
            return repetido;
        }
        const ativo = await repositorio.buscarTreinoAtivo(acesso.alunoId, transacao);
        if (ativo) {
            throw erroOperacao(409, 'Já existe um treino em andamento. Retome ou encerre essa sessão.');
        }
        await exigirChegada(acesso.alunoId, transacao);
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
                origem: rotina.origem,
                versao: rotina.versao,
                nome: rotina.conteudo.nome,
                divisao: divisao,
            },
        }, transacao);
    });
}
