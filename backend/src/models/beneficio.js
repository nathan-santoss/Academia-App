import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Beneficio', {
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
    origem: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    motivo: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    fim: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    autorContaId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'contas',
            key: 'id',
        },
    },
    revogadoEm: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'beneficios',
});
