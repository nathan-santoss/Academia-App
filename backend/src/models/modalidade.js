import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Modalidade', {

    id: {

        type: DataTypes.UUID,

        primaryKey: true,
    },

    nome: {

        type: DataTypes.STRING(100),

        allowNull: false,
    },

    precoCentavos: {

        type: DataTypes.INTEGER,

        allowNull: false,
    },

    ativo: {

        type: DataTypes.BOOLEAN,

        defaultValue: true,

        allowNull: false,
    },
}, {

    tableName: 'modalidades',
});
