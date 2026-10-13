// Descrevo o perfil de aluno, sua matrícula e o vínculo com a pessoa cadastrada.
import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';
import Pessoa from './pessoa.js';

// Descrevo o perfil do aluno, mantendo os dados pessoais no modelo Pessoa.
const Aluno = banco.define('Aluno', {
    // Identifico o perfil com um UUID independente da matrícula apresentada na tela.
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    // Exijo uma pessoa vinculada e permito apenas um perfil de aluno por pessoa.
    pessoaId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: 'alunos_pessoa_unica',
    },
    // Delego ao banco a sequência das matrículas, inclusive em cadastros simultâneos.
    numeroMatricula: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: 'alunos_matricula_unica',
        // Peço ao PostgreSQL o próximo número da sequência, sem tentar calcular a matrícula no JavaScript.
        autoIncrement: true,
    },
    // Marco o cadastro como ativo; isso não significa plano pago ou entrada liberada.
    ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    // Guardo o endereço opcional da foto; o arquivo da imagem não fica nesta coluna.
    fotoUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
    },
    // Reúno nome e telefone do contato opcional em um objeto JSON no PostgreSQL.
    contatoEmergencia: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
}, {
    // Escolho o nome da tabela usada para os perfis de alunos.
    tableName: 'alunos',
});

// Relaciono cada perfil de aluno à sua identidade central.
Aluno.belongsTo(Pessoa, {
    foreignKey: 'pessoaId',
    // Acesso os dados relacionados como aluno.pessoa nas consultas do repositório.
    // Dou o apelido pessoa à relação, para conseguir ler aluno.pessoa nas consultas.
    as: 'pessoa',
    // Bloqueio a exclusão de uma pessoa que ainda possui perfil de aluno.
    onDelete: 'RESTRICT',
});

export default Aluno;
