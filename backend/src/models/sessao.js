// Registro os acessos abertos para conferir e encerrar cada sessão no servidor.
// Descrevo a entidade e seus vínculos com Sequelize. A preparação das tabelas fica em config/criar-tabelas.js; os
// repositórios usam este modelo para consultar ou gravar. Sou usado por criar-tabelas.js, acesso-repositorio.js.

import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';
import Conta from './conta.js';

// Preparo Sessao com esta chamada. Descrevo um modelo no Sequelize; a criação da tabela acontece depois, na
// preparação do banco.
const Sessao = banco.define('Sessao', {
    // Uso o resumo da credencial como chave, nunca a credencial original.
    tokenResumo: {
        // Limito o campo tokenResumo a 64 caracteres com STRING para manter o tamanho previsto no cadastro.
        type: DataTypes.STRING(64),
        // Marco este campo como chave principal, que identifica o registro na tabela.
        primaryKey: true,
    }, // Concluo os campos de tokenResumo e volto ao objeto que reúne essa configuração.
    // Descrevo o campo contaId neste modelo; abaixo escolho seu tipo e as regras que a tabela deve respeitar.
    contaId: {
        // Escolho um identificador UUID para o Sequelize preparar a coluna contaId corretamente.
        type: DataTypes.UUID,
        // Recuso null em contaId para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de contaId e volto ao objeto que reúne essa configuração.
    // Descrevo o campo expiraEm neste modelo; abaixo escolho seu tipo e as regras que a tabela deve respeitar.
    expiraEm: {
        // Escolho uma data com horário para o Sequelize preparar a coluna expiraEm corretamente.
        type: DataTypes.DATE,
        // Recuso null em expiraEm para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de expiraEm e volto ao objeto que reúne essa configuração.
}, { // Concluo este objeto com os campos que a etapa atual precisa.
    // Escolho o nome real da tabela para a aplicação não depender da sugestão automática do Sequelize.
    tableName: 'sessoes',
}); // Concluo este objeto com os campos que a etapa atual precisa.

// Ligo cada sessão à conta para consultar o bloqueio em todo pedido.
Sessao.belongsTo(Conta, {
    // Indico o campo que guarda a ligação entre este registro e o modelo relacionado.
    foreignKey: 'contaId',
    // Dou um nome à relação para acessar o registro relacionado pelo mesmo nome nas consultas.
    as: 'conta',
    // Defino o que o banco faz com o vínculo quando o registro relacionado é apagado.
    onDelete: 'CASCADE',
}); // Concluo este objeto com os campos que a etapa atual precisa.

// Disponibilizo Sessao como exportação principal para os outros arquivos importarem.
export default Sessao;
