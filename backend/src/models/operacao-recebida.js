// Guardo no Neon o resultado de cada operação para impedir gravações duplicadas no reenvio.
import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('OperacaoRecebida', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    resumo: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    resultado: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
}, {
    tableName: 'operacoes_recebidas',
});
