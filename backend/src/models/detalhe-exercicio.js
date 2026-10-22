import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';
import Exercicio from './exercicio.js';

const DetalheExercicio = banco.define('DetalheExercicio', {
    exercicioId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: 'exercicios',
            key: 'id',
        },
    },
    autorContaId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    origem: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    termosBusca: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    imagemUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
    },
    videoUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
    },
    revisao: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'detalhes_exercicios',
});
Exercicio.hasOne(DetalheExercicio, {
    foreignKey: 'exercicioId',
    as: 'detalhes',
});
export default DetalheExercicio;
