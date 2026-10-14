import { ConnectionError, ConnectionAcquireTimeoutError } from 'sequelize';

export function falhaDeConexao(falha) {

    if (falha instanceof ConnectionError || falha instanceof ConnectionAcquireTimeoutError) {

        return true;
    }

    let origem = falha;

    if (falha.original) {

        origem = falha.original;
    }

    return [

        'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENETUNREACH',

        'EAI_AGAIN', 'ENOTFOUND', '08000', '08003', '08006', '57014',

        '57P01', '57P02', '57P03',
    ].includes(origem.code);
}
