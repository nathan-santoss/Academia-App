import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

const Pessoa = banco.define('Pessoa', {

    id: {

        type: DataTypes.UUID,

        defaultValue: DataTypes.UUIDV4,

        primaryKey: true,
    },

    nome: {

        type: DataTypes.STRING(150),

        allowNull: false,
    },

    cpf: {

        type: DataTypes.STRING(11),

        allowNull: false,

        unique: 'pessoas_cpf_unico',
    },

    dataNascimento: {

        type: DataTypes.DATEONLY,

        allowNull: false,
    },

    email: {

        type: DataTypes.STRING(254),

        allowNull: false,
    },

    telefone: {

        type: DataTypes.STRING(11),

        allowNull: false,
    },
}, {

    tableName: 'pessoas',
});

export default Pessoa;
