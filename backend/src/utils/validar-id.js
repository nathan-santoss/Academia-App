// Confiro UUIDs e gero o identificador quando o cliente não precisa controlar reenvios.
import { randomUUID } from 'node:crypto';
import { erroOperacao } from './erro-operacao.js';

export function exigirId(valor) {
    // Confiro com test se o texto tem o formato de UUID v4 que eu uso nos cadastros e nos pedidos.
    if (typeof valor !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor)) {
        throw erroOperacao(422, 'Informe um identificador UUID válido.');
    }

    // Padronizo as letras em minúsculas para o mesmo UUID não parecer diferente só por causa da escrita.
    return valor.toLowerCase();
}

export function obterIdOperacao(valor) {
    // Aceito o cadastro do mobile sem exigir um cabeçalho adicional.
    if (valor === undefined) {
        // Gero um UUID novo quando o cliente não mandou um; não peço uma chave extra só para cadastrar.
        return randomUUID();
    }

    // Quando o cliente trouxe um ID, eu valido em vez de trocar por outro e perder a referência do reenvio.
    return exigirId(valor);
}
