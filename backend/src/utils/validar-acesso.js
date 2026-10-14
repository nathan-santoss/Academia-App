import { erroOperacao } from './erro-operacao.js';

export function validarAcesso(entrada) {

    if (!entrada || typeof entrada.email !== 'string' || typeof entrada.senha !== 'string') {

        throw erroOperacao(422, 'Informe seu e-mail e sua senha.');
    }

    const email = entrada.email.trim().toLowerCase();

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        throw erroOperacao(422, 'Informe um e-mail válido.');
    }

    if (!entrada.senha || entrada.senha.length > 128) {

        throw erroOperacao(422, 'Informe uma senha com até 128 caracteres.');
    }

    return {

        email: email,

        senha: entrada.senha,
    };
}
