import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Exercicio', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    codigo: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true,
    },
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    grupoMuscular: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    equipamento: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    tipo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['repeticoes', 'duracao']],
        },
    },
    descricao: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    demonstrativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'exercicios',
});
