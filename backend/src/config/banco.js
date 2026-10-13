// Configuro a conexão privada do Sequelize com o PostgreSQL do Neon.
import { Sequelize } from 'sequelize';

// Exijo a conexão privada do Neon; ela não é uma senha para as requisições da API.
if (!process.env.DATABASE_URL) {
    throw new Error('Preencha DATABASE_URL no arquivo backend/.env.');
}

let endereco;

try {
    // Interpreto a URL para separar o banco, o usuário e o endereço do servidor.
    endereco = new URL(process.env.DATABASE_URL);
} catch {
    // Indico um formato inválido sem mostrar a URL privada na mensagem.
    throw new Error('Confira o formato de DATABASE_URL no .env.');
}

// Aceito somente os protocolos usados nas conexões PostgreSQL.
if (endereco.protocol !== 'postgres:' && endereco.protocol !== 'postgresql:') {
    throw new Error('DATABASE_URL precisa ser uma conexão PostgreSQL.');
}

// Adoto a porta padrão do PostgreSQL quando a URL não informa outra.
let porta = 5432;

if (endereco.port) {
    porta = Number(endereco.port);
}

// Separo os dados da URL para manter a validação SSL explícita.
const banco = new Sequelize(
    // Recupero os valores originais caso tenham caracteres codificados na URL.
    decodeURIComponent(endereco.pathname.slice(1)),
    decodeURIComponent(endereco.username),
    decodeURIComponent(endereco.password),
    {
        host: endereco.hostname,
        port: porta,
        dialect: 'postgres',
        // Desativo a impressão das consultas para não expor dados no terminal.
        logging: false,
        dialectOptions: {
            // Valido o certificado do servidor ao estabelecer a conexão criptografada.
            ssl: {
                rejectUnauthorized: true,
            },
            // Aguardo até dez segundos pela abertura de uma conexão.
            connectionTimeoutMillis: 10000,
        },
        // Uso sublinhados nas colunas e nomes em português nas datas dos modelos.
        define: {
            underscored: true,
            createdAt: 'criadoEm',
            updatedAt: 'atualizadoEm',
        },
    },
);

export default banco;
