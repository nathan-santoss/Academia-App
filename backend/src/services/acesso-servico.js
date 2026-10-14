// Confiro o login e a sessão antes de liberar os dados da própria pessoa.
import { randomBytes, randomUUID } from 'node:crypto';
import { UniqueConstraintError } from 'sequelize';
import * as repositorio from '../repositories/acesso-repositorio.js';
import { conferirSenha, protegerSenha, resumirToken } from '../utils/senha.js';
import { validarAcesso } from '../utils/validar-acesso.js';
import { erroOperacao } from '../utils/erro-operacao.js';
import { validarCadastroAluno, prepararCadastroAluno } from '../utils/validar-aluno.js';

// Faço o mesmo cálculo para um e-mail desconhecido, sem revelar quais contas existem.
const senhaSemConta = protegerSenha(randomBytes(32).toString('hex'));

export async function criarConta(entrada) {
    const acesso = validarAcesso(entrada);
    const mensagem = validarCadastroAluno(entrada);
    if (mensagem) {
        throw erroOperacao(422, mensagem);
    }
    // Peço uma frase longa e aceito espaços, sem exigir combinações difíceis de decorar.
    if (acesso.senha.length < 15) {
        throw erroOperacao(422, 'Escolha uma senha com pelo menos 15 caracteres. Você pode usar uma frase.');
    }
    const senhaProtegida = await protegerSenha(acesso.senha);
    try {
        // Gero os IDs no servidor e nunca assumo um cadastro antigo pelo CPF informado.
        await repositorio.criarConta({
            id: randomUUID(),
            pessoaId: randomUUID(),
            dados: prepararCadastroAluno(entrada),
        }, senhaProtegida);
    } catch (falha) {
        if (falha instanceof UniqueConstraintError) {
            throw erroOperacao(409, 'Já existe um cadastro com esses dados. Se você criou a conta, entre com sua senha. Para um cadastro antigo, procure a academia.');
        }
        throw falha;
    }
    // Confirmo o cadastro separado do login para permitir entrar se a resposta se perder na rede.
    return {
        mensagem: 'Conta criada. Entre com seu e-mail e sua senha.',
    };
}

export async function entrar(entrada) {
    const dados = validarAcesso(entrada);
    const conta = await repositorio.buscarContaPorEmail(dados.email);
    let senhaProtegida = await senhaSemConta;

    if (conta) {
        senhaProtegida = conta.senhaProtegida;
    }
    const senhaCorreta = await conferirSenha(dados.senha, senhaProtegida);
    if (!conta || !senhaCorreta || !conta.ativo || !conta.aluno || !conta.aluno.ativo) {
        throw erroOperacao(401, 'E-mail ou senha incorretos, ou conta indisponível.');
    }

    // Crio uma credencial imprevisível; só devolvo seu valor original nesta resposta.
    const token = randomBytes(32).toString('hex');
    // Uso os trinta dias aprovados para a turma, com opção de ajuste no ambiente.
    let dias = 30;
    if (process.env.SESSAO_DIAS) {
        dias = Number(process.env.SESSAO_DIAS);
    }
    if (!Number.isInteger(dias) || dias < 1 || dias > 365) {
        throw erroOperacao(503, 'O acesso está sendo preparado. Tente novamente mais tarde.');
    }
    const expiraEm = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
    await repositorio.salvarSessao({
        tokenResumo: resumirToken(token),
        contaId: conta.id,
        expiraEm: expiraEm,
    });
    return {
        token: token,
        expiraEm: expiraEm,
    };
}

export async function conferirSessao(cabecalho) {
    // Aceito apenas o token de uma sessão criada pelo servidor, nunca CPF ou ID do aparelho.
    if (typeof cabecalho !== 'string' || !/^Bearer [a-f0-9]{64}$/.test(cabecalho)) {
        throw erroOperacao(401, 'Entre na sua conta para continuar.');
    }
    const resumo = resumirToken(cabecalho.slice(7));
    const sessao = await repositorio.buscarSessao(resumo);
    if (!sessao || sessao.expiraEm.getTime() <= Date.now()) {
        throw erroOperacao(401, 'Sua sessão terminou. Entre novamente.');
    }
    const conta = sessao.conta;
    // Reconfiro os bloqueios para não manter o acesso de um cadastro desativado.
    if (!conta || !conta.ativo || !conta.aluno || !conta.aluno.ativo) {
        throw erroOperacao(401, 'Esta conta não está disponível para acesso.');
    }
    return {
        contaId: conta.id,
        alunoId: conta.alunoId,
        tokenResumo: resumo,
    };
}

export function sair(acesso) {
    // Revogo a credencial no servidor para que uma cópia dela também pare de funcionar.
    return repositorio.excluirSessao(acesso.tokenResumo);
}
