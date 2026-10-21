import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Notificacao', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    contaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'contas',
            key: 'id',
        },
    },
    evento: {
        type: DataTypes.STRING(160),
        allowNull: false,
    },
    mensagem: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    destino: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    lidaEm: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'notificacoes',
    indexes: [{
        unique: true,
        fields: ['conta_id', 'evento'],
    }],
});
