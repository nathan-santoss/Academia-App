import { createHmac } from 'node:crypto';
import { conferirConfiguracaoJwt } from './jwt.js';
import { erroOperacao } from './erro-operacao.js';

export function validarEmailRecuperacao(entrada) {
    if (!entrada || typeof entrada.email !== 'string' || entrada.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entrada.email.trim())) {
        throw erroOperacao(422, 'Informe um e-mail válido.');
    }
    return entrada.email.trim().toLowerCase();
}

export function politicaRecuperacao() {
    const minutos = Number(process.env.RECUPERACAO_MINUTOS);
    const tentativas = Number(process.env.RECUPERACAO_TENTATIVAS);
    if (!Number.isInteger(minutos) || minutos < 1 || minutos > 60 || !Number.isInteger(tentativas) || tentativas < 1 || tentativas > 10) {
        throw erroOperacao(503, 'Defina a validade e o limite de tentativas da recuperação antes de habilitar o recurso.');
    }
    return {
        minutos: minutos,
        tentativas: tentativas,
    };
}

export function resumirCodigo(contaId, codigo) {
    return createHmac('sha256', conferirConfiguracaoJwt()).update(contaId + ':' + codigo).digest('hex');
}
