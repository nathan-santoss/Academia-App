import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Chegada', {
    id: {
        type: DataTypes.UUID,
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
    dia: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    autorizadaPor: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    autorizadaEm: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    motivo: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    confirmadaPor: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    confirmadaEm: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'chegadas',
    indexes: [{
        unique: true,
        fields: ['aluno_id', 'dia'],
    }],
});
