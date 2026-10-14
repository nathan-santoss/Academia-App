import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Funcionario', {
    contaId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: 'contas',
            key: 'id',
        },
    },
    numeroMatricula: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        unique: true,
        allowNull: false,
    },
    papeis: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'funcionarios',
});
