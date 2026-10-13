// Armazeno os lembretes no Neon e separo as anotações por instalação do aplicativo.
import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Lembrete', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    aparelhoId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    titulo: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    dataHora: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
}, {
    tableName: 'lembretes',
});
