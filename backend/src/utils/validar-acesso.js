// Confiro e-mail e senha antes de consultar uma conta ou calcular a proteção da senha.
import { erroOperacao } from './erro-operacao.js';

export function validarAcesso(entrada) {
    // Recuso tipos inesperados antes de tentar usar os campos como texto.
    if (!entrada || typeof entrada.email !== 'string' || typeof entrada.senha !== 'string') {
        throw erroOperacao(422, 'Informe seu e-mail e sua senha.');
    }

    const email = entrada.email.trim().toLowerCase();
    // Limito a entrada para evitar cálculos caros com textos sem tamanho definido.
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw erroOperacao(422, 'Informe um e-mail válido.');
    }
    if (!entrada.senha || entrada.senha.length > 128) {
        throw erroOperacao(422, 'Informe uma senha com até 128 caracteres.');
    }
    // Preservo espaços e maiúsculas da senha, pois fazem parte do que a pessoa escolheu.
    return {
        email: email,
        senha: entrada.senha,
    };
}
