// Armazeno os lembretes no Neon e separo as anotações por instalação do aplicativo.
import { DataTypes } from 'sequelize';
import banco from '../config/banco.js';

// Descrevo os campos com define e deixo a criação da tabela para o arquivo de configuração.
export default banco.define('Lembrete', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    // Associo o lembrete à instalação que o criou; esse ID organiza os dados, mas não funciona como login.
    aparelhoId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    titulo: {
        // Limito o título a cem caracteres no banco, acompanhando a validação feita pelo serviço.
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    // Guardo o horário como texto ISO porque o serviço já entrega a data nesse formato.
    dataHora: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
}, {
    tableName: 'lembretes',
});
