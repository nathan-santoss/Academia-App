// Preparo o TypeORM sobre o SQLite e crio a tabela local quando ela ainda não existe.
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as SQLite from 'expo-sqlite';
import Lembrete from '../models/lembrete.js';

const banco = new DataSource({
    type: 'expo',
    database: 'academia-local.db',
    driver: SQLite,
    entities: [Lembrete],
    // Desativo alterações automáticas em tabelas que já possuem registros.
    synchronize: false,
    logging: false,
});

// Reaproveito a preparação para que duas telas não abram o banco ao mesmo tempo.
let preparacao = null;

async function criarBancoLocal() {
    await banco.initialize();
    const consulta = banco.createQueryRunner();

    try {
        // Crio a tabela pelo modelo somente na primeira utilização, sem recriar dados antigos.
        const tabelaExiste = await consulta.hasTable(Lembrete.options.tableName);

        if (!tabelaExiste) {
            await banco.synchronize();
        }
    } finally {
        await consulta.release();
    }

    return banco;
}

export function obterBancoLocal() {
    if (!preparacao) {
        // Permito uma nova tentativa se a abertura ou a criação da tabela falhar.
        preparacao = criarBancoLocal().catch(async function permitirNovaTentativa(falha) {
            // Fecho uma inicialização incompleta antes de permitir a próxima abertura.
            if (banco.isInitialized) {
                await banco.destroy();
            }

            preparacao = null;
            throw falha;
        });
    }

    return preparacao;
}
