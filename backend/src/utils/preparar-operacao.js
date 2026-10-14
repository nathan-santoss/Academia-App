// Identifico os dados de cada pedido para conferir reenvios já confirmados no Neon.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por persistencia-servico.js.

import { createHash } from 'node:crypto';

// Junto ID, tipo e dados com um resumo do conteúdo para conferir se um pedido repetido é realmente o mesmo.
export function prepararOperacao(id, tipo, entrada) {
    // Transformo tipo e entrada em texto JSON e alimento o SHA-256 com esse conteúdo; pedidos iguais geram o mesmo
    // resumo.
    const resumo = createHash('sha256').update(JSON.stringify({
        // Identifico o tipo de operação para que a etapa seguinte escolha a ação correta.
        tipo: tipo,
        // Junto os dados que a operação deve levar até o repositório.
        entrada: entrada,
    })).digest('hex'); // Finalizo o resumo em hexadecimal com digest; depois comparo esse texto de 64 caracteres com o recibo salvo.

    // Reúno o ID, o conteúdo e o resumo em um objeto só para o repositório receber o pedido completo.
    return {
        // Informo o identificador deste registro para conseguir encontrá-lo depois.
        id: id,
        // Identifico o tipo de operação para que a etapa seguinte escolha a ação correta.
        tipo: tipo,
        // Junto os dados que a operação deve levar até o repositório.
        entrada: entrada,
        // Registro o resumo do conteúdo para conferir se um reenvio representa o mesmo pedido.
        resumo: resumo,
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino prepararOperacao e devolvo o controle a quem chamou.
