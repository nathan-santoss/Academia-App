// Distingo uma interrupção de conexão de erros de cadastro, permissão ou estrutura do banco.
export function falhaDeConexao(falha) {
    const nomes = [
        'SequelizeConnectionRefusedError',
        'SequelizeConnectionTimedOutError',
        'SequelizeConnectionAcquireTimeoutError',
        'SequelizeHostNotReachableError',
        'SequelizeHostNotFoundError',
    ];

    if (nomes.includes(falha.name)) {
        return true;
    }

    let origem = falha;

    if (falha.original) {
        origem = falha.original;
    }

    // Não trato senha incorreta, SQL inválido ou CPF duplicado como indisponibilidade.
    return ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENETUNREACH',
        'EAI_AGAIN', 'ENOTFOUND', '08000', '08003', '08006', '57P01', '57P02', '57P03'].includes(origem.code);
}
