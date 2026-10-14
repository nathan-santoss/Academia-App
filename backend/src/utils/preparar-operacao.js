import { createHash } from 'node:crypto';

export function prepararOperacao(id, tipo, entrada) {

    const resumo = createHash('sha256').update(JSON.stringify({

        tipo: tipo,

        entrada: entrada,
    })).digest('hex');

    return {

        id: id,

        tipo: tipo,

        entrada: entrada,

        resumo: resumo,
    };
}
