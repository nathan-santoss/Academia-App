// Configuro a conexão privada do Sequelize com o PostgreSQL do Neon.
// Preparo uma conexão compartilhada para todos os modelos. Uso Sequelize para trabalhar com objetos JavaScript; a
// biblioteca monta as consultas PostgreSQL. Leio a senha só no ambiente do backend.

import { Sequelize } from 'sequelize';

// Busco a conexão no ambiente para não precisar deixar a senha escrita no projeto.
if (!process.env.DATABASE_URL) {
    // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
    throw new Error('Configure DATABASE_URL nas variáveis de ambiente do backend.');
} // Encerro a conferência de process.env.DATABASE_URL.

// Reservo endereco para receber o resultado mais adiante, dentro deste fluxo.
let endereco;
// Reservo nomeBanco para receber o resultado mais adiante, dentro deste fluxo.
let nomeBanco;
// Reservo usuario para receber o resultado mais adiante, dentro deste fluxo.
let usuario;
// Reservo senha para receber o resultado mais adiante, dentro deste fluxo.
let senha;

// Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com await.
try {
    // Uso URL para separar o endereço em partes; assim eu não preciso cortar a conexão na mão.
    endereco = new URL(process.env.DATABASE_URL);
    // Tiro a barra inicial do caminho com slice e recupero caracteres codificados, como %40 no lugar de @.
    nomeBanco = decodeURIComponent(endereco.pathname.slice(1));
    // Atualizo usuario com o resultado de decodeURIComponent. Recupero os caracteres codificados na URL, como
    // símbolos do usuário e da senha.
    usuario = decodeURIComponent(endereco.username);
    // Atualizo senha com o resultado de decodeURIComponent. Recupero os caracteres codificados na URL, como símbolos
    // do usuário e da senha.
    senha = decodeURIComponent(endereco.password);
// Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
} catch {
    // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
    throw new Error('Confira o formato de DATABASE_URL nas variáveis de ambiente.');
} // Termino o tratamento desta falha e sigo para a limpeza, quando houver.

// Aceito os dois nomes usados pelo PostgreSQL, mas paro aqui se vier uma URL de outro tipo de banco.
if (endereco.protocol !== 'postgres:' && endereco.protocol !== 'postgresql:') {
    // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
    throw new Error('DATABASE_URL precisa ser uma conexão PostgreSQL.');
} // Encerro a conferência de esta condição.

// Confiro se o endereço é do Neon e se vieram todas as partes necessárias para conectar.
if (!endereco.hostname.endsWith('.neon.tech') || !nomeBanco || !usuario || !senha || endereco.hash) {
    // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
    throw new Error('Use a URL completa do Neon, com servidor, banco, usuário e senha.');
} // Encerro a conferência de esta condição.

// Uso a porta padrão do PostgreSQL quando a URL não traz uma porta própria.
let porta = 5432;

// Uso a porta escrita na URL quando ela substitui a porta padrão do PostgreSQL.
if (endereco.port) {
    // Atualizo porta com o resultado de Number. Converto o valor para número antes de fazer contas ou validar
    // limites.
    porta = Number(endereco.port);
} // Encerro a conferência de endereco.port.

// Não deixo uma porta fora desse intervalo seguir até o driver, onde o erro seria mais difícil de entender.
if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
    // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
    throw new Error('A porta de DATABASE_URL precisa estar entre 1 e 65535.');
} // Encerro a conferência de esta condição.

// Defino SSL explicitamente para preservar a validação do certificado do Neon.
const banco = new Sequelize(nomeBanco, usuario, senha, {
    // Indico o endereço do servidor que receberá esta conexão.
    host: endereco.hostname,
    // Indico a porta usada para alcançar o serviço configurado.
    port: porta,
    // Informo que o Sequelize deve usar PostgreSQL, que é o banco oferecido pelo Neon.
    dialect: 'postgres',
    // Desligo o log das consultas para não acabar exibindo dados dos cadastros no terminal.
    logging: false,
    // Passo opções específicas ao driver que abre a conexão PostgreSQL.
    dialectOptions: {
        // Configuro a conexão protegida por TLS com o banco remoto.
        ssl: {
            // Exijo um certificado válido para conferir a identidade do servidor que está recebendo a conexão.
            rejectUnauthorized: true,
        }, // Concluo os campos de ssl e volto ao objeto que reúne essa configuração.
        // Dou dez segundos para abrir a conexão; logo abaixo, também limito cada instrução SQL a dez segundos.
        connectionTimeoutMillis: 10000,
        // Limito a duração de cada instrução SQL para não deixar uma operação presa no banco.
        statement_timeout: 10000,
    }, // Concluo os campos de dialectOptions e volto ao objeto que reúne essa configuração.
    // Reaproveito conexões com o pool, em vez de abrir uma nova do zero a cada pedido.
    pool: {
        // Limito a quantidade máxima de conexões abertas por este backend.
        max: 5,
        // Defino quantas conexões o pool precisa manter mesmo sem uso.
        min: 0,
        // Espero até quinze segundos por uma conexão livre; depois disso, prefiro devolver uma falha.
        acquire: 15000,
        // Defino quanto tempo uma conexão pode ficar sem uso antes de ser liberada.
        idle: 10000,
    }, // Concluo os campos de pool e volto ao objeto que reúne essa configuração.
    // Deixo estes padrões para todos os modelos, como criadoEm e atualizadoEm no lugar dos nomes em inglês.
    define: {
        // Uso nomes com sublinhado nas colunas do banco e mantenho os nomes JavaScript nos modelos.
        underscored: true,
        // Escolho o nome do campo preenchido automaticamente quando o registro é criado.
        createdAt: 'criadoEm',
        // Escolho o nome do campo atualizado automaticamente quando o registro muda.
        updatedAt: 'atualizadoEm',
    }, // Concluo os campos de define e volto ao objeto que reúne essa configuração.
}); // Concluo este objeto com os campos que a etapa atual precisa.

// Disponibilizo banco como exportação principal para os outros arquivos importarem.
export default banco;
