// Reduzo tentativas repetidas no login e no cadastro para proteger as contas e o servidor.
// Sou usado antes do cadastro e do login. Conto as tentativas pelo e-mail normalizado para reduzir repetições sem
// juntar todas as pessoas que usam o mesmo Wi-Fi; esta contagem fica na memória do servidor.

import { rateLimit } from 'express-rate-limit';
import { resumirToken } from '../utils/senha.js';
import { validarAcesso } from '../utils/validar-acesso.js';

// Preparo limitarAcesso com esta chamada. Preparo o contador de tentativas que a rota chama antes de permitir o
// acesso.
export const limitarAcesso = rateLimit({
    // Conto as tentativas por e-mail, evitando bloquear toda a turma que usa o mesmo Wi-Fi.
    windowMs: 60 * 1000,
    // Permito até esta quantidade de tentativas por chave durante a janela configurada.
    limit: 10,
    // Extraio o e-mail validado e uso seu resumo como chave da contagem de tentativas.
    keyGenerator: function identificarTentativa(requisicao) {
        // Preparo dados com esta chamada. Chamo validarAcesso em validar-acesso.js. Nesse passo, confiro tipos e
        // limites do e-mail e da senha antes de fazer consultas ou cálculos mais caros.
        const dados = validarAcesso(requisicao.body);
        // Reaproveito a função de resumo para o e-mail normalizado; aqui o resultado identifica a contagem de
        // tentativas, não uma sessão.
        return resumirToken(dados.email);
    }, // Termino identificarTentativa e devolvo o controle a quem chamou.
    // Uso o formato indicado de cabeçalhos para informar o limite de tentativas na resposta.
    standardHeaders: 'draft-8',
    // Desligo os cabeçalhos antigos para não repetir a mesma informação em dois formatos.
    legacyHeaders: false,
    // Agrupo os campos de message para manter essa parte do objeto organizada.
    message: {
        // Escolho a mensagem que será entregue a quem chamou este trecho.
        mensagem: 'Muitas tentativas para este e-mail. Aguarde um minuto e tente novamente.',
    }, // Concluo os campos de message e volto ao objeto que reúne essa configuração.
}); // Concluo este objeto com os campos que a etapa atual precisa.
