// Derivo um UUID estável para a pessoa sem mudar sua identidade quando o cadastro for reenviado.
import { createHash } from 'node:crypto';

export function idPessoa(idOperacao) {
    const texto = createHash('sha256').update('pessoa:' + idOperacao).digest('hex');
    return texto.slice(0, 8) + '-' + texto.slice(8, 12) + '-4' + texto.slice(13, 16)
        + '-8' + texto.slice(17, 20) + '-' + texto.slice(20, 32);
}
