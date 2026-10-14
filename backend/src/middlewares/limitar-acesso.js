import { rateLimit } from 'express-rate-limit';
import { resumirToken } from '../utils/senha.js';
import { validarAcesso } from '../utils/validar-acesso.js';

export const limitarAcesso = rateLimit({

    windowMs: 60 * 1000,

    limit: 10,

    keyGenerator: function identificarTentativa(requisicao) {

        const dados = validarAcesso(requisicao.body);

        return resumirToken(dados.email);
    },

    standardHeaders: 'draft-8',

    legacyHeaders: false,

    message: {

        mensagem: 'Muitas tentativas para este e-mail. Aguarde um minuto e tente novamente.',
    },
});

export const limitarOrigem = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        mensagem: 'Muitas tentativas de acesso. Aguarde um minuto.',
    },
});
