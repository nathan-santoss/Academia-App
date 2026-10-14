// Descrevo as atividades adicionais e seus preços próprios, sem fixar valores no código.
// Descrevo a entidade e seus vínculos com Sequelize. A preparação das tabelas fica em config/criar-tabelas.js; os
// repositórios usam este modelo para consultar ou gravar. Sou usado por criar-tabelas.js, operacao-online.js.

import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

// Descrevo uma modalidade do catálogo aqui, sem criar um vínculo dela com um aluno.
export default banco.define('Modalidade', {
    // Descrevo o campo id neste modelo; abaixo escolho seu tipo e as regras que a tabela deve respeitar.
    id: {
        // Escolho um identificador UUID para o Sequelize preparar a coluna id corretamente.
        type: DataTypes.UUID,
        // Marco este campo como chave principal, que identifica o registro na tabela.
        primaryKey: true,
    }, // Concluo os campos de id e volto ao objeto que reúne essa configuração.
    // Deixo o nome obrigatório para não acabar com um item sem identificação no catálogo.
    nome: {
        // Limito o campo nome a 100 caracteres com STRING para manter o tamanho previsto no cadastro.
        type: DataTypes.STRING(100),
        // Recuso null em nome para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de nome e volto ao objeto que reúne essa configuração.
    // Uso um inteiro para o preço em centavos, assim eu não preciso arredondar valores decimais.
    precoCentavos: {
        // Escolho um número inteiro para o Sequelize preparar a coluna precoCentavos corretamente.
        type: DataTypes.INTEGER,
        // Recuso null em precoCentavos para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de precoCentavos e volto ao objeto que reúne essa configuração.
    // Descrevo o campo ativo neste modelo; abaixo escolho seu tipo e as regras que a tabela deve respeitar.
    ativo: {
        // Escolho verdadeiro ou falso para o Sequelize preparar a coluna ativo corretamente.
        type: DataTypes.BOOLEAN,
        // Uso true quando a criação não informa este campo; o Sequelize aplica esse padrão.
        defaultValue: true,
        // Recuso null em ativo para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de ativo e volto ao objeto que reúne essa configuração.
}, { // Concluo este objeto com os campos que a etapa atual precisa.
    // Escolho o nome da tabela explicitamente para não depender do nome que o Sequelize sugeriria.
    tableName: 'modalidades',
}); // Concluo este objeto com os campos que a etapa atual precisa.
