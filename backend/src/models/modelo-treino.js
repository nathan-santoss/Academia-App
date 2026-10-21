import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('ModeloTreino', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    autorContaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'contas',
            key: 'id',
        },
    },
    oficial: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    conteudo: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    revisao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'modelos_treino',
});
