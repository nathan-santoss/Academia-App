// Aplico cada escrita e seu recibo na mesma transação para tornar o reenvio seguro.
import banco from '../config/banco.js';
import OperacaoRecebida from '../models/operacao-recebida.js';
import Pessoa from '../models/pessoa.js';
import Aluno from '../models/aluno.js';
import Lembrete from '../models/lembrete.js';
import Plano from '../models/plano.js';
import Modalidade from '../models/modalidade.js';
import { apresentarAluno } from '../utils/formatar-aluno.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export function modeloDaCategoria(categoria) {
    if (categoria === 'lembrete') {
        return Lembrete;
    }

    if (categoria === 'plano') {
        return Plano;
    }

    if (categoria === 'modalidade') {
        return Modalidade;
    }

    throw erroOperacao(422, 'Categoria não reconhecida.');
}

async function gravarAluno(entrada, transacao) {
    const dados = entrada.dados;
    const pessoa = await Pessoa.create({
        id: entrada.pessoaId,
        nome: dados.nome,
        cpf: dados.cpf,
        dataNascimento: dados.dataNascimento,
        email: dados.email,
        telefone: dados.telefone,
    }, {
        transaction: transacao,
    });

    // Deixo a matrícula definitiva para a sequência do Neon, nunca para o cache.
    const aluno = await Aluno.create({
        id: entrada.id,
        pessoaId: pessoa.id,
        fotoUrl: dados.fotoUrl,
        contatoEmergencia: dados.contatoEmergencia,
    }, {
        transaction: transacao,
    });
    aluno.pessoa = pessoa;
    return apresentarAluno(aluno);
}

async function gravarRegistro(operacao, transacao) {
    const entrada = operacao.entrada;
    const modelo = modeloDaCategoria(entrada.categoria);
    const existente = await modelo.findByPk(entrada.id, {
        transaction: transacao,
        lock: transacao.LOCK.UPDATE,
    });

    if (operacao.tipo === 'excluir') {
        // Confiro a instalação dona do lembrete antes de remover a anotação.
        if (existente && existente.aparelhoId !== entrada.aparelhoId) {
            throw erroOperacao(403, 'Este lembrete pertence a outra instalação.');
        }

        if (existente) {
            await existente.destroy({
                transaction: transacao,
            });
        }

        return {
            id: entrada.id,
            excluido: true,
        };
    }

    if (existente) {
        // Recuso a edição antiga quando outro pedido já mudou o registro no Neon.
        if (!entrada.versaoAnterior || existente.atualizadoEm.toISOString() !== entrada.versaoAnterior) {
            throw erroOperacao(409, 'O registro foi alterado. Atualize os dados antes de editar novamente.');
        }

        await existente.update(entrada.dados, {
            transaction: transacao,
        });
        return existente.toJSON();
    }

    if (entrada.versaoAnterior) {
        throw erroOperacao(409, 'O registro original não está mais disponível.');
    }

    const registro = await modelo.create(Object.assign({}, entrada.dados, {
        id: entrada.id,
    }), {
        transaction: transacao,
    });
    return registro.toJSON();
}

export async function executarOperacaoOnline(operacao) {
    return banco.transaction(async function gravarComRecibo(transacao) {
        const recibo = await OperacaoRecebida.findByPk(operacao.id, {
            transaction: transacao,
        });

        // Recupero o resultado quando o Neon gravou, mas a confirmação anterior se perdeu.
        if (recibo) {
            if (recibo.resumo !== operacao.resumo) {
                throw erroOperacao(409, 'O identificador desta operação já foi usado com outros dados.');
            }

            return recibo.resultado;
        }

        let resultado;

        if (operacao.entrada.categoria === 'aluno') {
            resultado = await gravarAluno(operacao.entrada, transacao);
        } else {
            resultado = await gravarRegistro(operacao, transacao);
        }

        await OperacaoRecebida.create({
            id: operacao.id,
            resumo: operacao.resumo,
            resultado: resultado,
        }, {
            transaction: transacao,
        });

        return resultado;
    });
}

export async function consultarCategoriaOnline(categoria) {
    if (categoria === 'aluno') {
        const alunos = await Aluno.findAll({
            include: [{
                model: Pessoa,
                as: 'pessoa',
            }],
            order: [['numeroMatricula', 'ASC']],
        });
        return alunos.map(apresentarAluno);
    }

    const registros = await modeloDaCategoria(categoria).findAll({
        order: [['criadoEm', 'ASC']],
    });
    return registros.map(function apresentar(registro) {
        return registro.toJSON();
    });
}
