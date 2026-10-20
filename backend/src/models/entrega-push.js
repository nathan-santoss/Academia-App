import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('EntregaPush', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    notificacaoId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    contaId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    estado: {
        type: DataTypes.STRING(20),
        defaultValue: 'pendente',
        allowNull: false,
    },
    ticketId: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    tentativas: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    proximaEm: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
}, {
    tableName: 'entregas_push',
    indexes: [{
        unique: true,
        fields: ['notificacao_id', 'token'],
    }],
});
