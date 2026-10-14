// Defino a conta de acesso e a ligação com o aluno, sem misturar senha aos dados públicos.
// Descrevo a entidade e seus vínculos com Sequelize. A preparação das tabelas fica em config/criar-tabelas.js; os
// repositórios usam este modelo para consultar ou gravar. Sou usado por criar-tabelas.js, sessao.js,
// acesso-repositorio.js.

import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';
import Aluno from './aluno.js';

// Preparo Conta com esta chamada. Descrevo um modelo no Sequelize; a criação da tabela acontece depois, na preparação
// do banco.
const Conta = banco.define('Conta', {
    // Identifico cada conta por um UUID; o Sequelize gera esse valor na criação quando ele não foi informado.
    id: {
        // Escolho um identificador UUID para o Sequelize preparar a coluna id corretamente.
        type: DataTypes.UUID,
        // Uso DataTypes.UUIDV4 quando a criação não informa este campo; o Sequelize aplica esse padrão.
        defaultValue: DataTypes.UUIDV4,
        // Marco este campo como chave principal, que identifica o registro na tabela.
        primaryKey: true,
    }, // Concluo os campos de id e volto ao objeto que reúne essa configuração.
    // Descrevo o campo email neste modelo; abaixo escolho seu tipo e as regras que a tabela deve respeitar.
    email: {
        // Limito o campo email a 254 caracteres com STRING para manter o tamanho previsto no cadastro.
        type: DataTypes.STRING(254),
        // Recuso null em email para exigir um valor armazenado nessa coluna.
        allowNull: false,
        // Impeço que dois registros tenham o mesmo valor de email.
        unique: true,
    }, // Concluo os campos de email e volto ao objeto que reúne essa configuração.
    // Salvo apenas o resultado do cálculo da senha.
    senhaProtegida: {
        // Limito o campo senhaProtegida a 200 caracteres com STRING para manter o tamanho previsto no cadastro.
        type: DataTypes.STRING(200),
        // Recuso null em senhaProtegida para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de senhaProtegida e volto ao objeto que reúne essa configuração.
    // Descrevo o campo alunoId neste modelo; abaixo escolho seu tipo e as regras que a tabela deve respeitar.
    alunoId: {
        // Escolho um identificador UUID para o Sequelize preparar a coluna alunoId corretamente.
        type: DataTypes.UUID,
        // Recuso null em alunoId para exigir um valor armazenado nessa coluna.
        allowNull: false,
        // Impeço que dois registros tenham o mesmo valor de alunoId.
        unique: true,
    }, // Concluo os campos de alunoId e volto ao objeto que reúne essa configuração.
    // Reservo um bloqueio simples que também vale para sessões já abertas.
    ativo: {
        // Escolho verdadeiro ou falso para o Sequelize preparar a coluna ativo corretamente.
        type: DataTypes.BOOLEAN,
        // Recuso null em ativo para exigir um valor armazenado nessa coluna.
        allowNull: false,
        // Uso true quando a criação não informa este campo; o Sequelize aplica esse padrão.
        defaultValue: true,
    }, // Concluo os campos de ativo e volto ao objeto que reúne essa configuração.
}, { // Concluo este objeto com os campos que a etapa atual precisa.
    // Escolho o nome real da tabela para a aplicação não depender da sugestão automática do Sequelize.
    tableName: 'contas',
}); // Concluo este objeto com os campos que a etapa atual precisa.

// Exijo que a conta aponte para um aluno real; não concedo acesso a funcionários aqui.
Conta.belongsTo(Aluno, {
    // Indico o campo que guarda a ligação entre este registro e o modelo relacionado.
    foreignKey: 'alunoId',
    // Dou um nome à relação para acessar o registro relacionado pelo mesmo nome nas consultas.
    as: 'aluno',
    // Defino o que o banco faz com o vínculo quando o registro relacionado é apagado.
    onDelete: 'RESTRICT',
}); // Concluo este objeto com os campos que a etapa atual precisa.

// Disponibilizo Conta como exportação principal para os outros arquivos importarem.
export default Conta;
