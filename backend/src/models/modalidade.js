// Descrevo as atividades adicionais e seus preços próprios, sem fixar valores no código.
import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

// Descrevo uma modalidade do catálogo aqui, sem criar um vínculo dela com um aluno.
export default banco.define('Modalidade', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    // Deixo o nome obrigatório para não acabar com um item sem identificação no catálogo.
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    // Uso um inteiro para o preço em centavos, assim eu não preciso arredondar valores decimais.
    precoCentavos: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
}, {
    // Escolho o nome da tabela explicitamente para não depender do nome que o Sequelize sugeriria.
    tableName: 'modalidades',
});
