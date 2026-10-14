// Defino os planos de musculação com preço configurável e período, sem criar uma assinatura.
// Descrevo a entidade e seus vínculos com Sequelize. A preparação das tabelas fica em config/criar-tabelas.js; os
// repositórios usam este modelo para consultar ou gravar. Sou usado por criar-tabelas.js, operacao-online.js.

import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

// Uso define para ensinar ao Sequelize quais campos formam um plano.
export default banco.define('Plano', {
    // Descrevo o campo id neste modelo; abaixo escolho seu tipo e as regras que a tabela deve respeitar.
    id: {
        // Escolho um identificador UUID para o Sequelize preparar a coluna id corretamente.
        type: DataTypes.UUID,
        // Marco este campo como chave principal, que identifica o registro na tabela.
        primaryKey: true,
    }, // Concluo os campos de id e volto ao objeto que reúne essa configuração.
    // Descrevo o campo nome neste modelo; abaixo escolho seu tipo e as regras que a tabela deve respeitar.
    nome: {
        // Limito o campo nome a 100 caracteres com STRING para manter o tamanho previsto no cadastro.
        type: DataTypes.STRING(100),
        // Recuso null em nome para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de nome e volto ao objeto que reúne essa configuração.
    // Guardo o preço em centavos inteiros; por exemplo, 9990 representa R$ 99,90 sem conta com casas decimais.
    precoCentavos: {
        // Escolho um número inteiro para o Sequelize preparar a coluna precoCentavos corretamente.
        type: DataTypes.INTEGER,
        // Recuso null em precoCentavos para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de precoCentavos e volto ao objeto que reúne essa configuração.
    // Salvo o período escolhido no catálogo; a lista de opções permitidas fica na validação.
    periodo: {
        // Limito o campo periodo a 20 caracteres com STRING para manter o tamanho previsto no cadastro.
        type: DataTypes.STRING(20),
        // Recuso null em periodo para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de periodo e volto ao objeto que reúne essa configuração.
    // Descrevo o campo ativo neste modelo; abaixo escolho seu tipo e as regras que a tabela deve respeitar.
    ativo: {
        // Escolho verdadeiro ou falso para o Sequelize preparar a coluna ativo corretamente.
        type: DataTypes.BOOLEAN,
        // Começo com o item ativo quando nenhum valor foi definido; isso não cria uma assinatura para o aluno.
        defaultValue: true,
        // Recuso null em ativo para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de ativo e volto ao objeto que reúne essa configuração.
}, { // Concluo este objeto com os campos que a etapa atual precisa.
    // Escolho o nome real da tabela para a aplicação não depender da sugestão automática do Sequelize.
    tableName: 'planos',
}); // Concluo este objeto com os campos que a etapa atual precisa.
