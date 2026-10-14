// Registro os acessos abertos para conferir e encerrar cada sessão no servidor.
import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';
import Conta from './conta.js';

const Sessao = banco.define('Sessao', {
    // Uso o resumo da credencial como chave, nunca a credencial original.
    tokenResumo: {
        type: DataTypes.STRING(64),
        primaryKey: true,
    },
    contaId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    expiraEm: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'sessoes',
});

// Ligo cada sessão à conta para consultar o bloqueio em todo pedido.
Sessao.belongsTo(Conta, {
    foreignKey: 'contaId',
    as: 'conta',
    onDelete: 'CASCADE',
});

export default Sessao;
