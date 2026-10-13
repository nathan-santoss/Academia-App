// Defino os planos de musculação com preço configurável e período, sem criar uma assinatura.
import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

export default banco.define('Plano', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    precoCentavos: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    periodo: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
}, {
    tableName: 'planos',
});
