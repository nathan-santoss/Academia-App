// Derivo um UUID estável para a pessoa sem mudar sua identidade quando o cadastro for reenviado.
import { createHash } from 'node:crypto';

export function idPessoa(idOperacao) {
    // Gero um resumo sempre igual para o mesmo pedido; assim eu mantenho o ID da pessoa estável no reenvio.
    // Uso o prefixo pessoa: para deixar claro que este identificador é da pessoa, e não do pedido.
    const texto = createHash('sha256').update('pessoa:' + idOperacao).digest('hex');
    // Recorto o resumo com slice e monto os grupos do UUID; o 4 e o 8 deixam o texto no formato aceito pela API.
    return texto.slice(0, 8) + '-' + texto.slice(8, 12) + '-4' + texto.slice(13, 16)
        + '-8' + texto.slice(17, 20) + '-' + texto.slice(20, 32);
}
