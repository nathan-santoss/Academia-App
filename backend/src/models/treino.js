import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Treino', {
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
    rotinaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'rotinas',
            key: 'id',
        },
    },
    referencia: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    series: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
    },
    revisao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'ativo',
    },
    encerradoEm: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'treinos',
    indexes: [{
        unique: true,
        fields: ['aluno_id'],
        where: {
            estado: 'ativo',
        },
    }],
});
