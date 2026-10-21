import { Sequelize } from 'sequelize';

let conexao = process.env.DATABASE_URL;
const emTeste = process.env.NODE_ENV === 'test' && Boolean(process.env.DATABASE_URL_TESTE);
if (emTeste) {
    conexao = process.env.DATABASE_URL_TESTE;
}
if (!conexao) {
    throw new Error('Configure DATABASE_URL nas variáveis de ambiente do backend.');
}
let endereco;
try {
    endereco = new URL(conexao);
} catch {
    throw new Error('Confira o formato da conexão PostgreSQL nas variáveis de ambiente.');
}
if (!['postgres:', 'postgresql:'].includes(endereco.protocol)) {
    throw new Error('A conexão precisa usar PostgreSQL.');
}
const nomeBanco = decodeURIComponent(endereco.pathname.slice(1));
const usuario = decodeURIComponent(endereco.username);
const senha = decodeURIComponent(endereco.password);
if (emTeste) {
    // Restrinjo os testes a uma base local identificada, sem permitir o Neon de produção.
    if (!['localhost', '127.0.0.1'].includes(endereco.hostname) || !nomeBanco.startsWith('academia_teste')) {
        throw new Error('DATABASE_URL_TESTE deve apontar para academia_teste em localhost.');
    }
} else if (!endereco.hostname.endsWith('.neon.tech') || !senha) {
    throw new Error('Use a URL completa do Neon, com servidor, banco, usuário e senha.');
}
if (!nomeBanco || !usuario || endereco.hash) {
    throw new Error('Informe banco e usuário válidos na conexão PostgreSQL.');
}
let porta = 5432;
if (endereco.port) {
    porta = Number(endereco.port);
}
let ssl = false;
if (!emTeste) {
    ssl = {
        rejectUnauthorized: true,
    };
}
const banco = new Sequelize(nomeBanco, usuario, senha, {
    host: endereco.hostname,
    port: porta,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: ssl,
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
