import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';
import Aluno from './aluno.js';

const Conta = banco.define('Conta', {

    id: {

        type: DataTypes.UUID,

        defaultValue: DataTypes.UUIDV4,

        primaryKey: true,
    },

    email: {

        type: DataTypes.STRING(254),

        allowNull: false,

        unique: true,
    },

    senhaProtegida: {

        type: DataTypes.STRING(200),

        allowNull: false,
    },

    alunoId: {

        type: DataTypes.UUID,

        allowNull: false,

        unique: true,
    },

    ativo: {

        type: DataTypes.BOOLEAN,

        allowNull: false,

        defaultValue: true,
    },
}, {

    tableName: 'contas',
});

Conta.belongsTo(Aluno, {

    foreignKey: 'alunoId',

    as: 'aluno',

    onDelete: 'RESTRICT',
});

export default Conta;
