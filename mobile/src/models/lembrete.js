// Defino o modelo dos lembretes para o ORM relacionar objetos JavaScript à tabela local.
import { EntitySchema } from 'typeorm';

export default new EntitySchema({
    name: 'Lembrete',
    tableName: 'lembretes',
    columns: {
        // Mantenho a sequência numérica já usada para identificar os avisos agendados.
        id: {
            type: 'integer',
            primary: true,
            generated: 'increment',
        },
        titulo: {
            type: 'text',
        },
        // Preservo o nome antigo da coluna e o horário ISO para aproveitar os registros existentes.
        dataHora: {
            name: 'data_hora',
            type: 'text',
        },
    },
});
