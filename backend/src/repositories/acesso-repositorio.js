// Consulto as contas e as sessões no Neon, sem expor senhas nas respostas da API.
import Conta from '../models/conta.js';
import Sessao from '../models/sessao.js';
import Aluno from '../models/aluno.js';
import banco from '../config/banco.js';
import { gravarAluno } from './operacao-online.js';

export function criarConta(entrada, senhaProtegida) {
    // Salvo pessoa, aluno e conta juntos: se qualquer etapa falhar, desfaço o cadastro inteiro.
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
    // Procuro o e-mail normalizado e junto o aluno para conferir se o vínculo está ativo.
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
    // Registro o resumo do token, a conta e a validade calculada pelo serviço.
    return Sessao.create(dados);
}

export function buscarSessao(tokenResumo) {
    // Releio os vínculos a cada acesso para respeitar um bloqueio feito depois do login.
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
    // Apago só a sessão usada neste aparelho; outras sessões continuam independentes.
    return Sessao.destroy({
        where: {
            tokenResumo: tokenResumo,
        },
    });
}
