import banco from '../config/banco.js';
import Conta from '../models/conta.js';
import Aluno from '../models/aluno.js';
import Pessoa from '../models/pessoa.js';
import Funcionario from '../models/funcionario.js';
import { gravarAluno } from './operacao-online.js';

export function executarProvisionamento(acao) {
    return banco.transaction(async function preparar(transacao) {
        await banco.query('SELECT pg_advisory_xact_lock(84731026)', {
            transaction: transacao,
        });
        return acao(transacao);
    });
}

export function buscarConta(email, transacao) {
    return Conta.findOne({
        where: {
            email: email,
        },
        include: [{
            model: Aluno,
            as: 'aluno',
            include: [{
                model: Pessoa,
                as: 'pessoa',
            }],
        }],
        transaction: transacao,
    });
}

export function buscarFuncionario(contaId, transacao) {
    return Funcionario.findByPk(contaId, {
        transaction: transacao,
    });
}

export async function criarContaFuncional(entrada, hash, papel, transacao) {
    const aluno = await gravarAluno(entrada, transacao);
    const conta = await Conta.create({
        email: aluno.email,
        alunoId: aluno.id,
        senhaProtegida: hash,
    }, {
        transaction: transacao,
    });
    await Funcionario.create({
        contaId: conta.id,
        papeis: [papel],
        ativo: true,
    }, {
        transaction: transacao,
    });
}
