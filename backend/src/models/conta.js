// Defino a conta de acesso e a ligação com o aluno, sem misturar senha aos dados públicos.
import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';
import Aluno from './aluno.js';

const Conta = banco.define('Conta', {
    // Deixo o banco identificar cada conta por um código próprio.
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true,
    },
    // Salvo apenas o resultado do cálculo da senha.
    senhaProtegida: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    alunoId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
    },
    // Reservo um bloqueio simples que também vale para sessões já abertas.
    ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'contas',
});

// Exijo que a conta aponte para um aluno real; não concedo acesso a funcionários aqui.
Conta.belongsTo(Aluno, {
    foreignKey: 'alunoId',
    as: 'aluno',
    onDelete: 'RESTRICT',
});

export default Conta;
