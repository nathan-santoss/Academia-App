import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';
import Conta from './conta.js';

const Sessao = banco.define('Sessao', {

    tokenResumo: {

        type: DataTypes.STRING(64),

        primaryKey: true,
    },

    contaId: {

        type: DataTypes.UUID,

        allowNull: false,
    },

    expiraEm: {

        type: DataTypes.DATE,

        allowNull: false,
    },
}, {

    tableName: 'sessoes',
});

Sessao.belongsTo(Conta, {

    foreignKey: 'contaId',

    as: 'conta',

    onDelete: 'CASCADE',
});

export default Sessao;
