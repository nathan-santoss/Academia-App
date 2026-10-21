import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Recuperacao', {
    contaId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: 'contas',
            key: 'id',
        },
    },
    codigoResumo: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    expiraEm: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    tentativas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    consumidoEm: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'recuperacoes',
});
