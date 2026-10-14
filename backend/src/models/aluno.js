// Descrevo o perfil de aluno, sua matrícula e o vínculo com a pessoa cadastrada.
// Descrevo a entidade e seus vínculos com Sequelize. A preparação das tabelas fica em config/criar-tabelas.js; os
// repositórios usam este modelo para consultar ou gravar. Sou usado por criar-tabelas.js, conta.js,
// acesso-repositorio.js e outros arquivos do mesmo fluxo.

import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';
import Pessoa from './pessoa.js';

// Descrevo o perfil do aluno, mantendo os dados pessoais no modelo Pessoa.
const Aluno = banco.define('Aluno', {
    // Identifico o perfil com um UUID independente da matrícula apresentada na tela.
    id: {
        // Escolho um identificador UUID para o Sequelize preparar a coluna id corretamente.
        type: DataTypes.UUID,
        // Uso DataTypes.UUIDV4 quando a criação não informa este campo; o Sequelize aplica esse padrão.
        defaultValue: DataTypes.UUIDV4,
        // Marco este campo como chave principal, que identifica o registro na tabela.
        primaryKey: true,
    }, // Concluo os campos de id e volto ao objeto que reúne essa configuração.
    // Exijo uma pessoa vinculada e permito apenas um perfil de aluno por pessoa.
    pessoaId: {
        // Escolho um identificador UUID para o Sequelize preparar a coluna pessoaId corretamente.
        type: DataTypes.UUID,
        // Recuso null em pessoaId para exigir um valor armazenado nessa coluna.
        allowNull: false,
        // Impeço que dois registros tenham o mesmo valor de pessoaId.
        unique: 'alunos_pessoa_unica',
    }, // Concluo os campos de pessoaId e volto ao objeto que reúne essa configuração.
    // Delego ao banco a sequência das matrículas, inclusive em cadastros simultâneos.
    numeroMatricula: {
        // Escolho um inteiro que pode ultrapassar o tamanho comum para o Sequelize preparar a coluna numeroMatricula
        // corretamente.
        type: DataTypes.BIGINT,
        // Recuso null em numeroMatricula para exigir um valor armazenado nessa coluna.
        allowNull: false,
        // Impeço que dois registros tenham o mesmo valor de numeroMatricula.
        unique: 'alunos_matricula_unica',
        // Peço ao PostgreSQL o próximo número da sequência, sem tentar calcular a matrícula no JavaScript.
        autoIncrement: true,
    }, // Concluo os campos de numeroMatricula e volto ao objeto que reúne essa configuração.
    // Marco o cadastro como ativo; isso não significa plano pago ou entrada liberada.
    ativo: {
        // Escolho verdadeiro ou falso para o Sequelize preparar a coluna ativo corretamente.
        type: DataTypes.BOOLEAN,
        // Recuso null em ativo para exigir um valor armazenado nessa coluna.
        allowNull: false,
        // Uso true quando a criação não informa este campo; o Sequelize aplica esse padrão.
        defaultValue: true,
    }, // Concluo os campos de ativo e volto ao objeto que reúne essa configuração.
    // Guardo o endereço opcional da foto; o arquivo da imagem não fica nesta coluna.
    fotoUrl: {
        // Limito o campo fotoUrl a 2048 caracteres com STRING para manter o tamanho previsto no cadastro.
        type: DataTypes.STRING(2048),
        // Permito null em fotoUrl quando o dado opcional não foi informado.
        allowNull: true,
    }, // Concluo os campos de fotoUrl e volto ao objeto que reúne essa configuração.
    // Reúno nome e telefone do contato opcional em um objeto JSON no PostgreSQL.
    contatoEmergencia: {
        // Escolho um conjunto de dados em JSON no PostgreSQL para o Sequelize preparar a coluna contatoEmergencia
        // corretamente.
        type: DataTypes.JSONB,
        // Permito null em contatoEmergencia quando o dado opcional não foi informado.
        allowNull: true,
    }, // Concluo os campos de contatoEmergencia e volto ao objeto que reúne essa configuração.
}, { // Concluo este objeto com os campos que a etapa atual precisa.
    // Escolho o nome da tabela usada para os perfis de alunos.
    tableName: 'alunos',
}); // Concluo este objeto com os campos que a etapa atual precisa.

// Relaciono cada perfil de aluno à sua identidade central.
Aluno.belongsTo(Pessoa, {
    // Indico o campo que guarda a ligação entre este registro e o modelo relacionado.
    foreignKey: 'pessoaId',
    // Acesso os dados relacionados como aluno.pessoa nas consultas do repositório. Dou o apelido pessoa à relação,
    // para conseguir ler aluno.pessoa nas consultas.
    as: 'pessoa',
    // Bloqueio a exclusão de uma pessoa que ainda possui perfil de aluno.
    onDelete: 'RESTRICT',
}); // Concluo este objeto com os campos que a etapa atual precisa.

// Disponibilizo Aluno como exportação principal para os outros arquivos importarem.
export default Aluno;
