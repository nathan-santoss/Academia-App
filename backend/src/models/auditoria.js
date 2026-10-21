import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Auditoria', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    atorContaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'contas',
            key: 'id',
        },
    },
    alunoId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    acao: {
        type: DataTypes.STRING(80),
        allowNull: false,
    },
    alvoId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    dados: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
}, {
    tableName: 'auditorias',
});
