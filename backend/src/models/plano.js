// Defino os planos de musculação com preço configurável e período, sem criar uma assinatura.
import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

// Uso define para ensinar ao Sequelize quais campos formam um plano.
export default banco.define('Plano', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    // Guardo o preço em centavos inteiros; por exemplo, 9990 representa R$ 99,90 sem conta com casas decimais.
    precoCentavos: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    // Salvo o período escolhido no catálogo; a lista de opções permitidas fica na validação.
    periodo: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        // Começo com o item ativo quando nenhum valor foi definido; isso não cria uma assinatura para o aluno.
        defaultValue: true,
        allowNull: false,
    },
}, {
    tableName: 'planos',
});
