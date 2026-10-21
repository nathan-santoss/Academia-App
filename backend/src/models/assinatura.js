import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Assinatura', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    alunoId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'alunos',
            key: 'id',
        },
    },
    planoId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    plano: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    vencimento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    toleranciaAte: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    canceladaEm: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'assinaturas',
});
