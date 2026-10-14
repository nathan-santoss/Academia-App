import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('RascunhoFicha', {
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
    contaId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    versaoBase: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    revisao: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    conteudo: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    publicadaId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
}, {
    tableName: 'rascunhos_ficha',
    indexes: [{
        unique: true,
        fields: ['aluno_id', 'conta_id'],
    }],
});
