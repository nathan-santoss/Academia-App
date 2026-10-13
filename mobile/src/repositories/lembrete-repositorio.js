// Uso o modelo de lembrete para consultar, salvar e excluir registros pelo ORM local.
import { obterBancoLocal } from '../config/banco-local.js';
import Lembrete from '../models/lembrete.js';

export async function listarLembretesSalvos() {
    const banco = await obterBancoLocal();

    // Ordeno os objetos pelo horário; o ORM traduz a consulta para o SQLite.
    return banco.getRepository(Lembrete).find({
        order: {
            dataHora: 'ASC',
            id: 'ASC',
        },
    });
}

export async function inserirLembrete(lembrete) {
    const banco = await obterBancoLocal();

    // Envio somente os campos do modelo e deixo o SQLite gerar o identificador.
    return banco.getRepository(Lembrete).save({
        titulo: lembrete.titulo,
        dataHora: lembrete.dataHora,
    });
}

export async function excluirLembreteSalvo(id) {
    const banco = await obterBancoLocal();

    // Removo apenas o registro escolhido pela pessoa.
    await banco.getRepository(Lembrete).delete(id);
}
