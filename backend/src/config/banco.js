// Configuro a conexão privada do Sequelize com o PostgreSQL do Neon.
import { Sequelize } from 'sequelize';

if (!process.env.DATABASE_URL) {
    throw new Error('Configure DATABASE_URL nas variáveis de ambiente do backend.');
}

let endereco;
let nomeBanco;
let usuario;
let senha;

try {
    // Separo os dados sem permitir que uma falha imprima a URL privada.
    endereco = new URL(process.env.DATABASE_URL);
    nomeBanco = decodeURIComponent(endereco.pathname.slice(1));
    usuario = decodeURIComponent(endereco.username);
    senha = decodeURIComponent(endereco.password);
} catch {
    throw new Error('Confira o formato de DATABASE_URL nas variáveis de ambiente.');
}

if (endereco.protocol !== 'postgres:' && endereco.protocol !== 'postgresql:') {
    throw new Error('DATABASE_URL precisa ser uma conexão PostgreSQL.');
}

if (!endereco.hostname.endsWith('.neon.tech') || !nomeBanco || !usuario || !senha || endereco.hash) {
    throw new Error('Use a URL completa do Neon, com servidor, banco, usuário e senha.');
}

let porta = 5432;

if (endereco.port) {
    porta = Number(endereco.port);
}

if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
    throw new Error('A porta de DATABASE_URL precisa estar entre 1 e 65535.');
}

// Defino SSL explicitamente para preservar a validação do certificado do Neon.
const banco = new Sequelize(nomeBanco, usuario, senha, {
    host: endereco.hostname,
    port: porta,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            rejectUnauthorized: true,
        },
        connectionTimeoutMillis: 10000,
        statement_timeout: 10000,
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 15000,
        idle: 10000,
    },
    define: {
        underscored: true,
        createdAt: 'criadoEm',
        updatedAt: 'atualizadoEm',
    },
});

export default banco;
