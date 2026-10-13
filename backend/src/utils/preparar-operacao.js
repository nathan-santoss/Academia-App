// Identifico os dados de cada pedido para conferir reenvios já confirmados no Neon.
import { createHash } from 'node:crypto';

export function prepararOperacao(id, tipo, entrada) {
    // Transformo o tipo e os dados em texto com JSON.stringify e passo esse texto ao SHA-256.
    // Uso digest com hex para obter um resumo de 64 caracteres que consigo comparar com o recibo do banco.
    const resumo = createHash('sha256').update(JSON.stringify({
        tipo: tipo,
        entrada: entrada,
    })).digest('hex');

    // Reúno o ID, o conteúdo e o resumo em um objeto só para o repositório receber o pedido completo.
    return {
        id: id,
        tipo: tipo,
        entrada: entrada,
        resumo: resumo,
    };
}
