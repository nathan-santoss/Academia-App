// Configuro a conexão privada do Sequelize com o PostgreSQL do Neon.
import { Sequelize } from 'sequelize';

// Busco a conexão no ambiente para não precisar deixar a senha escrita no projeto.
if (!process.env.DATABASE_URL) {
    throw new Error('Configure DATABASE_URL nas variáveis de ambiente do backend.');
}

let endereco;
let nomeBanco;
let usuario;
let senha;

try {
    // Uso URL para separar o endereço em partes; assim eu não preciso cortar a conexão na mão.
    endereco = new URL(process.env.DATABASE_URL);
    // Tiro a barra inicial do caminho com slice e recupero caracteres codificados, como %40 no lugar de @.
    nomeBanco = decodeURIComponent(endereco.pathname.slice(1));
    usuario = decodeURIComponent(endereco.username);
    senha = decodeURIComponent(endereco.password);
} catch {
    throw new Error('Confira o formato de DATABASE_URL nas variáveis de ambiente.');
}

// Aceito os dois nomes usados pelo PostgreSQL, mas paro aqui se vier uma URL de outro tipo de banco.
if (endereco.protocol !== 'postgres:' && endereco.protocol !== 'postgresql:') {
    throw new Error('DATABASE_URL precisa ser uma conexão PostgreSQL.');
}

// Confiro se o endereço é do Neon e se vieram todas as partes necessárias para conectar.
if (!endereco.hostname.endsWith('.neon.tech') || !nomeBanco || !usuario || !senha || endereco.hash) {
    throw new Error('Use a URL completa do Neon, com servidor, banco, usuário e senha.');
}

// Uso a porta padrão do PostgreSQL quando a URL não traz uma porta própria.
let porta = 5432;

if (endereco.port) {
    porta = Number(endereco.port);
}

// Não deixo uma porta fora desse intervalo seguir até o driver, onde o erro seria mais difícil de entender.
if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
    throw new Error('A porta de DATABASE_URL precisa estar entre 1 e 65535.');
}

// Defino SSL explicitamente para preservar a validação do certificado do Neon.
const banco = new Sequelize(nomeBanco, usuario, senha, {
    host: endereco.hostname,
    port: porta,
    dialect: 'postgres',
    // Desligo o log das consultas para não acabar exibindo dados dos cadastros no terminal.
    logging: false,
    dialectOptions: {
        ssl: {
            // Exijo um certificado válido para conferir a identidade do servidor que está recebendo a conexão.
            rejectUnauthorized: true,
        },
        // Dou dez segundos para abrir a conexão; logo abaixo, também limito cada instrução SQL a dez segundos.
        connectionTimeoutMillis: 10000,
        statement_timeout: 10000,
    },
    // Reaproveito conexões com o pool, em vez de abrir uma nova do zero a cada pedido.
    pool: {
        max: 5,
        min: 0,
        // Espero até quinze segundos por uma conexão livre; depois disso, prefiro devolver uma falha.
        acquire: 15000,
        idle: 10000,
    },
    // Deixo estes padrões para todos os modelos, como criadoEm e atualizadoEm no lugar dos nomes em inglês.
    define: {
        underscored: true,
        createdAt: 'criadoEm',
        updatedAt: 'atualizadoEm',
    },
});

export default banco;
