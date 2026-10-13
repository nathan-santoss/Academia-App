// Registro cada escrita ainda não confirmada no Neon para permitir reenvio após reiniciar.
import { DataTypes } from 'sequelize';
import { bancoLocal } from '../config/banco-local.js';

export default bancoLocal.define('OperacaoPendente', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    entrada: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    resumo: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    conflito: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'operacoes_pendentes',
});
