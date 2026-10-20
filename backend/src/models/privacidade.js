import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Privacidade', {
    alunoId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'alunos',
            key: 'id',
        },
        primaryKey: true,
    },
    compartilharMedidas: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'privacidades',
});
