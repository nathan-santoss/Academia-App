import Conta from '../models/conta.js';
import Sessao from '../models/sessao.js';
import Aluno from '../models/aluno.js';
import banco from '../config/banco.js';
import { gravarAluno } from './operacao-online.js';

export function criarConta(entrada, senhaProtegida) {

    return banco.transaction(async function cadastrar(transacao) {

        const aluno = await gravarAluno(entrada, transacao);

        await Conta.create({

            email: aluno.email,

            alunoId: aluno.id,

            senhaProtegida: senhaProtegida,
        }, {

            transaction: transacao,
        });
    });
}

export function buscarContaPorEmail(email) {

    return Conta.findOne({

        where: {

            email: email,
        },

        include: [{

            model: Aluno,

            as: 'aluno',
        }],
    });
}

export function salvarSessao(dados) {

    return Sessao.create(dados);
}

export function buscarSessao(tokenResumo) {

    return Sessao.findByPk(tokenResumo, {

        include: [{

            model: Conta,

            as: 'conta',

            include: [{

                model: Aluno,

                as: 'aluno',
            }],
        }],
    });
}

export function excluirSessao(tokenResumo) {

    return Sessao.destroy({

        where: {

            tokenResumo: tokenResumo,
        },
    });
}

export function atualizarSenhaLegada(contaId, anterior, nova) {
    return Conta.update({
        senhaProtegida: nova,
    }, {
        where: {
            id: contaId,
            senhaProtegida: anterior,
        },
    });
}
