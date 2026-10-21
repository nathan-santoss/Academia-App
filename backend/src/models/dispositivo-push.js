import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('DispositivoPush', {
    token: {
        type: DataTypes.STRING(200),
        primaryKey: true,
    },
    contaId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    sessaoResumo: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
}, {
    tableName: 'dispositivos_push',
});
