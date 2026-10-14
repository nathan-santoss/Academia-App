// Reduzo tentativas repetidas no login e no cadastro para proteger as contas e o servidor.
import { rateLimit } from 'express-rate-limit';
import { resumirToken } from '../utils/senha.js';
import { validarAcesso } from '../utils/validar-acesso.js';

export const limitarAcesso = rateLimit({
    // Conto as tentativas por e-mail, evitando bloquear toda a turma que usa o mesmo Wi-Fi.
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
