import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';
import Pessoa from './pessoa.js';

const Aluno = banco.define('Aluno', {

    id: {

        type: DataTypes.UUID,

        defaultValue: DataTypes.UUIDV4,

        primaryKey: true,
    },

    pessoaId: {

        type: DataTypes.UUID,

        allowNull: false,

        unique: 'alunos_pessoa_unica',
    },

    numeroMatricula: {

        type: DataTypes.BIGINT,

        allowNull: false,

        unique: 'alunos_matricula_unica',

        autoIncrement: true,
    },

    ativo: {

        type: DataTypes.BOOLEAN,

        allowNull: false,

        defaultValue: true,
    },

    fotoUrl: {

        type: DataTypes.STRING(2048),

        allowNull: true,
    },

    contatoEmergencia: {

        type: DataTypes.JSONB,

        allowNull: true,
    },
}, {

    tableName: 'alunos',
});

Aluno.belongsTo(Pessoa, {

    foreignKey: 'pessoaId',

    as: 'pessoa',

    onDelete: 'RESTRICT',
});

export default Aluno;
