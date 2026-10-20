import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Medida', {
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
    tipo: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    valor: {
        type: DataTypes.DECIMAL(7, 2),
        allowNull: false,
    },
    dia: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    revisao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    tableName: 'medidas',
});
