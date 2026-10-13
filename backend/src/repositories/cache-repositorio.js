// Consulto e atualizo o cache pelo ORM local, mantendo registros pendentes durante a atualização.
import RegistroCache from '../models/registro-cache.js';
import OperacaoPendente from '../models/operacao-pendente.js';
import { bancoLocal } from '../config/banco-local.js';

export async function salvarCache(categoria, dados, pendente, transacao) {
    return RegistroCache.upsert({
        chave: categoria + ':' + dados.id,
        categoria: categoria,
        dados: dados,
        pendente: pendente,
    }, {
        transaction: transacao,
    });
}

export async function lerCache(categoria) {
    const registros = await RegistroCache.findAll({
        where: {
            categoria: categoria,
        },
    });

    return registros.map(function apresentar(registro) {
        return Object.assign({}, registro.dados, {
            pendenteSincronizacao: registro.pendente,
        });
    });
}

export async function substituirCache(categoria, dados) {
    // Troco a cópia em uma transação; uma falha mantém a versão anterior disponível.
    await bancoLocal.transaction(async function substituir(transacao) {
        await RegistroCache.destroy({
            where: {
                categoria: categoria,
                pendente: false,
            },
            transaction: transacao,
        });

        let indice = 0;

        while (indice < dados.length) {
            const registro = dados[indice];
            const existente = await RegistroCache.findByPk(categoria + ':' + registro.id, {
                transaction: transacao,
            });

            if (!existente || !existente.pendente) {
                await salvarCache(categoria, registro, false, transacao);
            }

            indice += 1;
        }
    });
}

export async function confirmarOperacao(operacao, resultado) {
    // Só retiro a operação da fila depois que o resultado do Neon foi recebido.
    await bancoLocal.transaction(async function confirmar(transacao) {
        const categoria = operacao.entrada.categoria;

        if (operacao.tipo === 'excluir') {
            await RegistroCache.destroy({
                where: {
                    chave: categoria + ':' + operacao.entrada.id,
                },
                transaction: transacao,
            });
        } else {
            await salvarCache(categoria, resultado, false, transacao);
        }

        await OperacaoPendente.destroy({
            where: {
                id: operacao.id,
            },
            transaction: transacao,
        });
    });
}
