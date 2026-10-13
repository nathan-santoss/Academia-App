// Represento a identidade central da pessoa e defino seus dados e a unicidade do CPF.
import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

// Represento a pessoa separadamente do perfil que ela possui na academia.
const Pessoa = banco.define('Pessoa', {
    // Gero um UUID para identificar a pessoa sem usar o CPF como chave principal.
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    // Reservo espaço para o nome e exijo seu preenchimento.
    nome: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    // Armazeno os onze dígitos como texto e impeço CPFs repetidos no banco.
    cpf: {
        type: DataTypes.STRING(11),
        allowNull: false,
        unique: 'pessoas_cpf_unico',
    },
    // Guardo apenas a data de nascimento, pois esse campo não precisa de horário.
    dataNascimento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    // Mantenho o e-mail obrigatório entre os dados de contato da pessoa.
    email: {
        type: DataTypes.STRING(254),
        allowNull: false,
    },
    // Conservo o telefone com DDD, já normalizado antes da gravação.
    telefone: {
        type: DataTypes.STRING(11),
        allowNull: false,
    },
}, {
    // Defino explicitamente o nome da tabela que o Sequelize criará.
    tableName: 'pessoas',
});

export default Pessoa;
