import { randomBytes, randomUUID } from 'node:crypto';
import { UniqueConstraintError } from 'sequelize';
import * as repositorio from '../repositories/acesso-repositorio.js';
import { conferirSenha, protegerSenha, resumirToken, senhaLegada, cabeNoBcrypt, validarSenhaNova } from '../utils/senha.js';
import { emitirToken, verificarToken } from '../utils/jwt.js';
import { validarAcesso } from '../utils/validar-acesso.js';
import { erroOperacao } from '../utils/erro-operacao.js';
import { validarCadastroAluno, prepararCadastroAluno } from '../utils/validar-aluno.js';

const senhaSemConta = protegerSenha(randomBytes(32).toString('hex'));

export async function criarConta(entrada) {

    const acesso = validarAcesso(entrada);

    const mensagem = validarCadastroAluno(entrada);

    if (mensagem) {

        throw erroOperacao(422, mensagem);
    }
    validarSenhaNova(acesso.senha);

    const senhaProtegida = await protegerSenha(acesso.senha);

    try {

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

    if (senhaLegada(senhaProtegida) && cabeNoBcrypt(dados.senha) && dados.senha.length >= 8) {
        try {
            const novaProtecao = await protegerSenha(dados.senha);
            await repositorio.atualizarSenhaLegada(conta.id, senhaProtegida, novaProtecao);
        } catch {
            console.warn('Migração de senha adiada; o acesso válido foi preservado.');
        }
    }

    let dias = 30;

    if (process.env.SESSAO_DIAS) {

        dias = Number(process.env.SESSAO_DIAS);
    }

    if (!Number.isInteger(dias) || dias < 1 || dias > 365) {

        throw erroOperacao(503, 'O acesso está sendo preparado. Tente novamente mais tarde.');
    }

    const expiraEm = new Date((Math.floor(Date.now() / 1000) + dias * 86400) * 1000);
    const token = emitirToken(conta.id, expiraEm);

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

    if (typeof cabecalho !== 'string' || cabecalho.length > 4096 || !/^Bearer [A-Za-z0-9_.-]+$/.test(cabecalho)) {

        throw erroOperacao(401, 'Entre na sua conta para continuar.');
    }

    const token = cabecalho.slice(7);
    let identidade = null;
    const limiteLegado = Date.parse(process.env.TOKEN_LEGADO_ATE);
    if (/^[a-f0-9]{64}$/.test(token) && Number.isFinite(limiteLegado) && Date.now() < limiteLegado) {
        identidade = null;
    } else {
        identidade = verificarToken(token);
    }
    const resumo = resumirToken(token);

    const sessao = await repositorio.buscarSessao(resumo);

    if (!sessao || sessao.expiraEm.getTime() <= Date.now()) {

        throw erroOperacao(401, 'Sua sessão terminou. Entre novamente.');
    }

    const conta = sessao.conta;
    if (identidade && (!conta || identidade.sub !== conta.id || identidade.exp * 1000 !== sessao.expiraEm.getTime())) {
        throw erroOperacao(401, 'A credencial não corresponde a esta sessão.');
    }

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

    return repositorio.excluirSessao(acesso.tokenResumo);
}
