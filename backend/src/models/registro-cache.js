// Descrevo a cópia de cada registro confirmado ou pendente mantida somente no backend.
import { DataTypes } from 'sequelize';
import { bancoLocal } from '../config/banco-local.js';

export default bancoLocal.define('RegistroCache', {
    chave: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dados: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    pendente: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'registros_cache',
});
