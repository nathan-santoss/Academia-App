import { conferirReferencias } from './exercicio-servico.js';
import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import * as repositorio from '../repositories/treino-repositorio.js';
import { validarRotina, exigirNumero } from '../utils/validar-rotina.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function consultarRotinas(alunoId) {
    const pessoal = await repositorio.buscarRotinaAtual(alunoId, 'pessoal');
    const recomendada = await repositorio.buscarRotinaAtual(alunoId, 'recomendada');
    return {
        pessoal: pessoal,
        recomendada: recomendada,
    };
}

export async function salvarPessoal(acesso, entrada) {
    const conteudo = validarRotina(entrada);
    const versaoAnterior = exigirNumero(entrada.versaoAnterior, 'versão anterior', 0, 2147483646);
    if (entrada.ciente !== true) {
        throw erroOperacao(422, 'Confirme que esta rotina é pessoal e não é uma prescrição profissional.');
    }
    return repositorio.executarTransacao(async function salvar(transacao) {
        await repositorio.bloquearAluno(acesso.alunoId, transacao);
        const atual = await repositorio.buscarRotinaAtual(acesso.alunoId, 'pessoal', transacao);
        let versaoAtual = 0;
        if (atual) {
            versaoAtual = atual.versao;
        }
        if (versaoAnterior !== versaoAtual) {
            if (atual && versaoAnterior + 1 === versaoAtual && isDeepStrictEqual(atual.conteudo, conteudo)) {
                return atual;
            }
            throw erroOperacao(409, 'A rotina mudou em outro aparelho. Consulte a versão atual antes de salvar.');
        }
        if (atual && entrada.substituir !== true) {
            throw erroOperacao(422, 'Confirme a substituição da rotina pessoal atual.');
        }
        await conferirReferencias(conteudo, transacao);
        return repositorio.criarRotina({
            id: randomUUID(),
            alunoId: acesso.alunoId,
            origem: 'pessoal',
            versao: versaoAtual + 1,
            autorContaId: acesso.contaId,
            conteudo: conteudo,
        }, transacao);
    });
}
