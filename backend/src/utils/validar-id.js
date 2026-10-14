import { randomUUID } from 'node:crypto';
import { erroOperacao } from './erro-operacao.js';

export function exigirId(valor) {

    if (typeof valor !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor)) {

        throw erroOperacao(422, 'Informe um identificador UUID válido.');
    }

    return valor.toLowerCase();
}

export function obterIdOperacao(valor) {

    if (valor === undefined) {

        return randomUUID();
    }

    return exigirId(valor);
}
