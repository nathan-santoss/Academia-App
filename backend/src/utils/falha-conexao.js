// Reconheço falhas de conexão para devolver indisponibilidade sem esconder erros de cadastro.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por aplicacao.js, mensagem-falha-banco.js.

import { ConnectionError, ConnectionAcquireTimeoutError } from 'sequelize';

// Reconheço erros de comunicação para distinguir uma queda do banco de um cadastro inválido.
export function falhaDeConexao(falha) {
    // Reconheço os tipos de erro de conexão do Sequelize antes de olhar os códigos mais específicos.
    if (falha instanceof ConnectionError || falha instanceof ConnectionAcquireTimeoutError) {
        // Devolvo true como resultado desta conferência para quem chamou a função.
        return true;
    } // Encerro a conferência de esta condição.

    // Inicio origem com falha; vou ajustar esse valor conforme as condições abaixo.
    let origem = falha;

    // Pego original quando existe, porque o Sequelize costuma guardar ali a falha que veio do driver.
    if (falha.original) {
        // Atualizo origem com falha.original.
        origem = falha.original;
    } // Encerro a conferência de falha.original.

    // Procuro o código com includes para saber se ele está nesta lista de falhas de comunicação.
    return [
        // Reconheço conexão recusada, interrompida, demorada ou sem rota até o servidor.
        'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENETUNREACH',
        // Incluo falhas para localizar o endereço, problemas de conexão do PostgreSQL e cancelamento da consulta.
        'EAI_AGAIN', 'ENOTFOUND', '08000', '08003', '08006', '57014',
        // Considero também situações em que o PostgreSQL está sendo encerrado ou ainda não aceita conexões.
        '57P01', '57P02', '57P03',
    ].includes(origem.code); // Devolvo true se includes encontrar o código nessa lista; caso contrário, devolvo false.
} // Termino falhaDeConexao e devolvo o controle a quem chamou.
