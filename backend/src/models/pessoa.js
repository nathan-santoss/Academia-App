// Represento a identidade central da pessoa e defino seus dados e a unicidade do CPF.
// Descrevo a entidade e seus vínculos com Sequelize. A preparação das tabelas fica em config/criar-tabelas.js; os
// repositórios usam este modelo para consultar ou gravar. Sou usado por criar-tabelas.js, aluno.js,
// aluno-repositorio.js e outros arquivos do mesmo fluxo.

import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

// Represento a pessoa separadamente do perfil que ela possui na academia. Descrevo um modelo no Sequelize; a criação
// da tabela acontece depois, na preparação do banco.
const Pessoa = banco.define('Pessoa', {
    // Gero um UUID para identificar a pessoa sem usar o CPF como chave principal.
    id: {
        // Escolho um identificador UUID para o Sequelize preparar a coluna id corretamente.
        type: DataTypes.UUID,
        // Peço ao Sequelize um UUID novo quando o cadastro não trouxe um ID.
        defaultValue: DataTypes.UUIDV4,
        // Marco este campo como chave principal, que identifica o registro na tabela.
        primaryKey: true,
    }, // Concluo os campos de id e volto ao objeto que reúne essa configuração.
    // Reservo espaço para o nome e exijo seu preenchimento.
    nome: {
        // Limito o campo nome a 150 caracteres com STRING para manter o tamanho previsto no cadastro.
        type: DataTypes.STRING(150),
        // Recuso null em nome para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de nome e volto ao objeto que reúne essa configuração.
    // Armazeno os onze dígitos como texto e impeço CPFs repetidos no banco.
    cpf: {
        // Limito o campo cpf a 11 caracteres com STRING para manter o tamanho previsto no cadastro.
        type: DataTypes.STRING(11),
        // Recuso null em cpf para exigir um valor armazenado nessa coluna.
        allowNull: false,
        // Impeço que dois registros tenham o mesmo valor de cpf.
        unique: 'pessoas_cpf_unico',
    }, // Concluo os campos de cpf e volto ao objeto que reúne essa configuração.
    // Guardo apenas a data de nascimento, pois esse campo não precisa de horário.
    dataNascimento: {
        // Escolho uma data sem horário para o Sequelize preparar a coluna dataNascimento corretamente.
        type: DataTypes.DATEONLY,
        // Recuso null em dataNascimento para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de dataNascimento e volto ao objeto que reúne essa configuração.
    // Mantenho o e-mail obrigatório entre os dados de contato da pessoa.
    email: {
        // Limito o campo email a 254 caracteres com STRING para manter o tamanho previsto no cadastro.
        type: DataTypes.STRING(254),
        // Recuso null em email para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de email e volto ao objeto que reúne essa configuração.
    // Conservo o telefone com DDD, já normalizado antes da gravação.
    telefone: {
        // Limito o campo telefone a 11 caracteres com STRING para manter o tamanho previsto no cadastro.
        type: DataTypes.STRING(11),
        // Recuso null em telefone para exigir um valor armazenado nessa coluna.
        allowNull: false,
    }, // Concluo os campos de telefone e volto ao objeto que reúne essa configuração.
}, { // Concluo este objeto com os campos que a etapa atual precisa.
    // Defino explicitamente o nome da tabela que o Sequelize criará.
    tableName: 'pessoas',
}); // Concluo este objeto com os campos que a etapa atual precisa.

// Disponibilizo Pessoa como exportação principal para os outros arquivos importarem.
export default Pessoa;
