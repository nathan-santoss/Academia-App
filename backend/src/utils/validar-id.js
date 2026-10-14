// Confiro UUIDs e gero o identificador quando o cliente não precisa controlar reenvios.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por aluno-servico.js, catalogo-servico.js, lembrete-servico.js.

import { randomUUID } from 'node:crypto';
import { erroOperacao } from './erro-operacao.js';

// Confiro o formato do UUID antes de usá-lo em uma consulta; devolvo o texto normalizado.
export function exigirId(valor) {
    // Confiro com test se o texto tem o formato de UUID v4 que eu uso nos cadastros e nos pedidos.
    if (typeof valor !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor)) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, 'Informe um identificador UUID válido.');
    } // Encerro a conferência de esta condição.

    // Padronizo as letras em minúsculas para o mesmo UUID não parecer diferente só por causa da escrita.
    return valor.toLowerCase();
} // Termino exigirId e devolvo o controle a quem chamou.

// Reaproveito um ID válido recebido ou gero outro quando não foi enviado, preservando a referência de um reenvio.
export function obterIdOperacao(valor) {
    // Aceito o cadastro do mobile sem exigir um cabeçalho adicional.
    if (valor === undefined) {
        // Gero um UUID novo quando o cliente não mandou um; não peço uma chave extra só para cadastrar.
        return randomUUID();
    } // Encerro a conferência de valor.

    // Quando o cliente trouxe um ID, eu valido em vez de trocar por outro e perder a referência do reenvio.
    return exigirId(valor);
} // Termino obterIdOperacao e devolvo o controle a quem chamou.
