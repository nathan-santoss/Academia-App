// Derivo um UUID estável para a pessoa sem mudar sua identidade quando o cadastro for reenviado.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por aluno-servico.js.

import { createHash } from 'node:crypto';

// Derivo um ID estável do pedido para manter a mesma pessoa numa repetição daquela operação.
export function idPessoa(idOperacao) {
    // Calculo SHA-256 sobre pessoa: e o ID do pedido; digest transforma o resultado em texto hexadecimal. Assim, o
    // mesmo pedido sempre produz o mesmo ID de pessoa.
    const texto = createHash('sha256').update('pessoa:' + idOperacao).digest('hex');
    // Recorto o resumo com slice e monto os grupos do UUID; o 4 e o 8 deixam o texto no formato aceito pela API.
    return texto.slice(0, 8) + '-' + texto.slice(8, 12) + '-4' + texto.slice(13, 16)
        // Completo os grupos finais do UUID com outros trechos do resumo; mantenho o 8 nessa posição para respeitar o
        // formato aceito.
        + '-8' + texto.slice(17, 20) + '-' + texto.slice(20, 32);
} // Termino idPessoa e devolvo o controle a quem chamou.
