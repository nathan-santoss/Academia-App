import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Pagamento', {
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
    planoId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    plano: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    valorCentavos: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    metodo: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    registradoPor: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'contas',
            key: 'id',
        },
    },
    confirmadoPor: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    confirmadoEm: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    assinaturaId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    comprovante: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
}, {
    tableName: 'pagamentos',
});
