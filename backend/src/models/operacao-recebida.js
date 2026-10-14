// Guardo no Neon o resultado de cada operação para impedir gravações duplicadas no reenvio.
// Descrevo a entidade e seus vínculos com Sequelize. A preparação das tabelas fica em config/criar-tabelas.js; os
// repositórios usam este modelo para consultar ou gravar. Sou usado por criar-tabelas.js, operacao-online.js.

import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

// Uso define para descrever esta tabela; a criação dela acontece depois, na preparação do banco.
export default banco.define('OperacaoRecebida', {
    // Uso o ID do pedido como chave para encontrar rapidamente uma operação que já foi recebida.
    id: {
        // Escolho um identificador UUID para o Sequelize preparar a coluna id corretamente.
        type: DataTypes.UUID,
        // Marco este campo como chave principal, que identifica o registro na tabela.
        primaryKey: true,
    }, // Concluo os campos de id e volto ao objeto que reúne essa configuração.
    // Guardo os 64 caracteres do SHA-256 para comparar os dados de duas tentativas do mesmo pedido.
    resumo: {
        // Limito o campo resumo a 64 caracteres com STRING para manter o tamanho previsto no cadastro.
        type: DataTypes.STRING(64),
        // Recuso null em resumo para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de resumo e volto ao objeto que reúne essa configuração.
    // Salvo a resposta em JSONB para devolver os mesmos dados se o cliente repetir a operação.
    resultado: {
        // Escolho um conjunto de dados em JSON no PostgreSQL para o Sequelize preparar a coluna resultado
        // corretamente.
        type: DataTypes.JSONB,
        // Recuso null em resultado para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de resultado e volto ao objeto que reúne essa configuração.
}, { // Concluo este objeto com os campos que a etapa atual precisa.
    // Escolho o nome real da tabela para a aplicação não depender da sugestão automática do Sequelize.
    tableName: 'operacoes_recebidas',
}); // Concluo este objeto com os campos que a etapa atual precisa.
