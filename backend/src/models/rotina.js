import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

// Preservo cada versão para que uma edição não reescreva o treino já realizado.
export default banco.define('Rotina', {
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
    origem: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    versao: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    autorContaId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    conteudo: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
}, {
    tableName: 'rotinas',
    indexes: [{
        unique: true,
        fields: ['aluno_id', 'origem', 'versao'],
    }],
});
