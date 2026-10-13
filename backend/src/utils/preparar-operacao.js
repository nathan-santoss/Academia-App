// Identifico os dados de cada pedido para conferir reenvios já confirmados no Neon.
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
