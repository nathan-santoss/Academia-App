// Guardo no Neon o resultado de cada operação para impedir gravações duplicadas no reenvio.
import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

// Uso define para descrever esta tabela; a criação dela acontece depois, na preparação do banco.
export default banco.define('OperacaoRecebida', {
    // Uso o ID do pedido como chave para encontrar rapidamente uma operação que já foi recebida.
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    // Guardo os 64 caracteres do SHA-256 para comparar os dados de duas tentativas do mesmo pedido.
    resumo: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    // Salvo a resposta em JSONB para devolver os mesmos dados se o cliente repetir a operação.
    resultado: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
}, {
    tableName: 'operacoes_recebidas',
});
