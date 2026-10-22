import { erroOperacao } from './erro-operacao.js';

export function validarTokenPush(entrada) {
    if (!entrada || typeof entrada.token !== 'string' || entrada.token.length > 200 || !/^(Expo|Exponent)PushToken\[[A-Za-z0-9_-]+\]$/.test(entrada.token)) {
        throw erroOperacao(422, 'Informe um token de notificações Expo válido.');
    }
    return entrada.token;
}
