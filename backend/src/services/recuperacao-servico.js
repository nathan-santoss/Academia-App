import { randomInt, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import * as repositorio from '../repositories/recuperacao-repositorio.js';
import { executarTransacao, bloquearOperacao } from '../repositories/treino-repositorio.js';
import { transporteEmail, conferirConfiguracaoEmail } from '../config/email.js';
import { validarEmailRecuperacao, politicaRecuperacao, resumirCodigo } from '../utils/validar-recuperacao.js';
import { validarSenhaNova, protegerSenha } from '../utils/senha.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function solicitar(entrada) {
    const email = validarEmailRecuperacao(entrada);
    const politica = politicaRecuperacao();
    conferirConfiguracaoEmail();
    await executarTransacao(async function preparar(transacao) {
        await bloquearOperacao(email, transacao);
        const conta = await repositorio.buscarConta(email, transacao);
        if (!conta) {
            return;
        }
        const codigo = String(randomInt(1000000)).padStart(6, '0');
        await repositorio.salvar({
            contaId: conta.id,
            codigoResumo: resumirCodigo(conta.id, codigo),
            expiraEm: new Date(Date.now() + politica.minutos * 60000),
            tentativas: 0,
            consumidoEm: null,
        }, transacao);
        // Só confirmo a solicitação depois do aceite do servidor de e-mail; nunca devolvo o código pela API.
        try {
            await transporteEmail().sendMail({
                from: process.env.EMAIL_REMETENTE,
                to: email,
                subject: 'Recuperação de acesso',
                text: 'Seu código de uso único é ' + codigo + '. Ele expira em ' + politica.minutos + ' minutos. Se não solicitou, ignore esta mensagem.',
            });
        } catch {
            throw erroOperacao(503, 'Não foi possível enviar o e-mail de recuperação. Tente mais tarde.');
        }
    });
    return {
        mensagem: 'Se o e-mail corresponder a uma conta ativa, enviaremos um código de uso único.',
    };
}

export async function redefinir(entrada) {
    const email = validarEmailRecuperacao(entrada);
    const politica = politicaRecuperacao();
    if (typeof entrada.codigo !== 'string' || !/^\d{6}$/.test(entrada.codigo)) {
        throw erroOperacao(422, 'Informe o código de seis dígitos.');
    }
    validarSenhaNova(entrada.senha);
    const hash = await protegerSenha(entrada.senha);
    const alterada = await executarTransacao(async function confirmar(transacao) {
        await bloquearOperacao(email, transacao);
        const conta = await repositorio.buscarConta(email, transacao);
        if (!conta) {
            return false;
        }
        const registro = await repositorio.buscar(conta.id, transacao);
        if (!registro || registro.consumidoEm || registro.expiraEm.getTime() <= Date.now() || registro.tentativas >= politica.tentativas) {
            return false;
        }
        const resumo = resumirCodigo(conta.id, entrada.codigo);
        if (!timingSafeEqual(Buffer.from(resumo), Buffer.from(registro.codigoResumo))) {
            // Confirmo a tentativa errada na transação antes de devolver o erro ao cliente.
            await repositorio.atualizar(registro, {
                tentativas: registro.tentativas + 1,
            }, transacao);
            return false;
        }
        await repositorio.trocarSenha(conta, hash, transacao);
        await repositorio.atualizar(registro, {
            consumidoEm: new Date(),
        }, transacao);
        return true;
    });
    if (!alterada) {
        throw erroOperacao(422, 'Código inválido, expirado ou já utilizado.');
    }
    return {
        mensagem: 'Senha alterada. Entre novamente em seus aparelhos.',
    };
}
