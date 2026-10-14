// Armazeno os lembretes no Neon e separo as anotações por conta autenticada.
// Descrevo a entidade e seus vínculos com Sequelize. A preparação das tabelas fica em config/criar-tabelas.js; os
// repositórios usam este modelo para consultar ou gravar. Sou usado por criar-tabelas.js, operacao-online.js.

import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

// Descrevo os campos com define e deixo a criação da tabela para o arquivo de configuração.
export default banco.define('Lembrete', {
    // Descrevo o campo id neste modelo; abaixo escolho seu tipo e as regras que a tabela deve respeitar.
    id: {
        // Escolho um identificador UUID para o Sequelize preparar a coluna id corretamente.
        type: DataTypes.UUID,
        // Marco este campo como chave principal, que identifica o registro na tabela.
        primaryKey: true,
    }, // Concluo os campos de id e volto ao objeto que reúne essa configuração.
    // Associo o lembrete à conta identificada pelo servidor, sem confiar no ID enviado pelo app.
    contaId: {
        // Preservo o nome físico antigo da coluna para atualizar sem apagar a tabela existente.
        field: 'aparelho_id',
        // Escolho um identificador UUID para o Sequelize preparar a coluna contaId corretamente.
        type: DataTypes.UUID,
        // Recuso null em contaId para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de contaId e volto ao objeto que reúne essa configuração.
    // Descrevo o campo titulo neste modelo; abaixo escolho seu tipo e as regras que a tabela deve respeitar.
    titulo: {
        // Limito o campo titulo a 100 caracteres com STRING para manter o tamanho previsto no cadastro.
        type: DataTypes.STRING(100),
        // Recuso null em titulo para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de titulo e volto ao objeto que reúne essa configuração.
    // Guardo o horário como texto ISO porque o serviço já entrega a data nesse formato.
    dataHora: {
        // Limito o campo dataHora a 30 caracteres com STRING para manter o tamanho previsto no cadastro.
        type: DataTypes.STRING(30),
        // Recuso null em dataHora para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de dataHora e volto ao objeto que reúne essa configuração.
}, { // Concluo este objeto com os campos que a etapa atual precisa.
    // Escolho o nome real da tabela para a aplicação não depender da sugestão automática do Sequelize.
    tableName: 'lembretes',
}); // Concluo este objeto com os campos que a etapa atual precisa.
