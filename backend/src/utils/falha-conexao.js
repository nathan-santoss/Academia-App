// Reconheço falhas de conexão para devolver indisponibilidade sem esconder erros de cadastro.
import { ConnectionError, ConnectionAcquireTimeoutError } from 'sequelize';

export function falhaDeConexao(falha) {
    // Reconheço os tipos de erro de conexão do Sequelize antes de olhar os códigos mais específicos.
    if (falha instanceof ConnectionError || falha instanceof ConnectionAcquireTimeoutError) {
        return true;
    }

    let origem = falha;

    // Pego original quando existe, porque o Sequelize costuma guardar ali a falha que veio do driver.
    if (falha.original) {
        origem = falha.original;
    }

    // Procuro o código com includes para saber se ele está nesta lista de falhas de comunicação.
    return [
        'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENETUNREACH',
        'EAI_AGAIN', 'ENOTFOUND', '08000', '08003', '08006', '57014',
        '57P01', '57P02', '57P03',
    ].includes(origem.code);
}
