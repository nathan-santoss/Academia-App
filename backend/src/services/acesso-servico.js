// Confiro o login e a sessão antes de liberar os dados da própria pessoa.
// Recebo os dados do controlador de acesso, confiro as regras com os utils e peço ao repositório as consultas e
// gravações. Devolvo uma sessão no login, uma confirmação no cadastro ou um erro que o Express vai tratar.

import { randomBytes, randomUUID } from 'node:crypto';
import { UniqueConstraintError } from 'sequelize';
import * as repositorio from '../repositories/acesso-repositorio.js';
import { conferirSenha, protegerSenha, resumirToken } from '../utils/senha.js';
import { validarAcesso } from '../utils/validar-acesso.js';
import { erroOperacao } from '../utils/erro-operacao.js';
import { validarCadastroAluno, prepararCadastroAluno } from '../utils/validar-aluno.js';

// Faço o mesmo cálculo para um e-mail desconhecido, sem revelar quais contas existem. Gero bytes aleatórios próprios
// para credenciais; isso evita um valor previsível.
const senhaSemConta = protegerSenha(randomBytes(32).toString('hex'));

// Confiro o cadastro e a senha antes de pedir ao repositório que crie a conta; só depois devolvo a confirmação.
export async function criarConta(entrada) {
    // Preparo acesso com esta chamada. Chamo validarAcesso em validar-acesso.js. Nesse passo, confiro tipos e limites
    // do e-mail e da senha antes de fazer consultas ou cálculos mais caros.
    const acesso = validarAcesso(entrada);
    // Preparo mensagem com esta chamada. Chamo validarCadastroAluno em validar-aluno.js. Nesse passo, confiro os
    // campos em ordem e devolvo a primeira mensagem de problema; texto vazio significa que posso continuar.
    const mensagem = validarCadastroAluno(entrada);
    // Interrompo o caminho de sucesso quando a validação devolveu uma mensagem.
    if (mensagem) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, mensagem);
    } // Encerro a conferência de mensagem.
    // Peço uma frase longa e aceito espaços, sem exigir combinações difíceis de decorar.
    if (acesso.senha.length < 15) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, 'Escolha uma senha com pelo menos 15 caracteres. Você pode usar uma frase.');
    } // Encerro a conferência de acesso.senha.length.
    // Espero o resultado antes de preencher senhaProtegida. Chamo protegerSenha em senha.js. Nesse passo, calculo uma
    // proteção para a senha com um sal aleatório; devolvo sal e resultado, nunca uma senha recuperável.
    const senhaProtegida = await protegerSenha(acesso.senha);
    // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
    // await.
    try {
        // Gero os IDs no servidor e nunca assumo um cadastro antigo pelo CPF informado.
        await repositorio.criarConta({
            // Informo o identificador deste registro para conseguir encontrá-lo depois.
            id: randomUUID(),
            // Ligo este registro à pessoa que reúne os dados pessoais.
            pessoaId: randomUUID(),
            // Reúno o conteúdo desta operação em dados para manter o formato esperado por quem recebe.
            dados: prepararCadastroAluno(entrada),
        }, senhaProtegida); // Concluo a função passada acima e informo os valores que controlam esta chamada.
    // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
    } catch (falha) {
        // Confiro se falha é um erro ou objeto do tipo UniqueConstraintError antes de executar o bloco abaixo.
        if (falha instanceof UniqueConstraintError) {
            // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
            throw erroOperacao(409, 'Já existe um cadastro com esses dados. Se você criou a conta, entre com sua senha. Para um cadastro antigo, procure a academia.');
        } // Encerro a conferência de falha.
        // Passo a falha adiante para o tratamento de quem chamou, preservando sua mensagem e seu tipo.
        throw falha;
    } // Termino o tratamento desta falha e sigo para a limpeza, quando houver.
    // Confirmo o cadastro separado do login para permitir entrar se a resposta se perder na rede.
    return {
        // Escolho a mensagem que será entregue a quem chamou este trecho.
        mensagem: 'Conta criada. Entre com seu e-mail e sua senha.',
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino criarConta e devolvo o controle a quem chamou.

// Valido e-mail e senha, confiro a conta e gravo uma sessão antes de devolver a credencial ao aplicativo.
export async function entrar(entrada) {
    // Preparo dados com esta chamada. Chamo validarAcesso em validar-acesso.js. Nesse passo, confiro tipos e limites
    // do e-mail e da senha antes de fazer consultas ou cálculos mais caros.
    const dados = validarAcesso(entrada);
    // Espero o resultado antes de preencher conta. Chamo repositorio.buscarContaPorEmail em acesso-repositorio.js.
    // Nesse passo, procuro a conta pelo e-mail normalizado e trago o aluno junto para conferir seu vínculo.
    const conta = await repositorio.buscarContaPorEmail(dados.email);
    // Espero o resultado antes de preencher senhaProtegida.
    let senhaProtegida = await senhaSemConta;

    // Leio a proteção da senha real somente se a consulta encontrou a conta.
    if (conta) {
        // Atualizo senhaProtegida com conta.senhaProtegida.
        senhaProtegida = conta.senhaProtegida;
    } // Encerro a conferência de conta.
    // Espero o resultado antes de preencher senhaCorreta. Chamo conferirSenha em senha.js. Nesse passo, repito o
    // cálculo usando o sal guardado e comparo os resultados para saber se a senha confere.
    const senhaCorreta = await conferirSenha(dados.senha, senhaProtegida);
    // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
    if (!conta || !senhaCorreta || !conta.ativo || !conta.aluno || !conta.aluno.ativo) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(401, 'E-mail ou senha incorretos, ou conta indisponível.');
    } // Encerro a conferência de esta condição.

    // Crio uma credencial imprevisível; só devolvo seu valor original nesta resposta.
    const token = randomBytes(32).toString('hex');
    // Uso os trinta dias aprovados para a turma, com opção de ajuste no ambiente.
    let dias = 30;
    // Troco o padrão de trinta dias pelo prazo informado no ambiente do backend.
    if (process.env.SESSAO_DIAS) {
        // Atualizo dias com o resultado de Number. Converto o valor para número antes de fazer contas ou validar
        // limites.
        dias = Number(process.env.SESSAO_DIAS);
    } // Encerro a conferência de process.env.SESSAO_DIAS.
    // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
    if (!Number.isInteger(dias) || dias < 1 || dias > 365) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(503, 'O acesso está sendo preparado. Tente novamente mais tarde.');
    } // Encerro a conferência de esta condição.
    // Crio expiraEm. Trabalho com um objeto Date para comparar ou formatar o instante recebido.
    const expiraEm = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
    // Espero esta tarefa terminar antes de continuar. Chamo repositorio.salvarSessao em acesso-repositorio.js. Nesse
    // passo, gravo a conta, o resumo do token e sua validade; o token original fica fora desta tabela.
    await repositorio.salvarSessao({
        // Uso o resumo da credencial para encontrar a sessão sem guardar o token original no banco.
        tokenResumo: resumirToken(token),
        // Associo os dados à conta conferida no acesso para separar as informações de cada pessoa.
        contaId: conta.id,
        // Registro até quando esta sessão pode ser aceita pelo backend.
        expiraEm: expiraEm,
    }); // Concluo este objeto com os campos que a etapa atual precisa.
    // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
    return {
        // Devolvo a credencial da sessão para que o aplicativo consiga fazer pedidos autenticados.
        token: token,
        // Registro até quando esta sessão pode ser aceita pelo backend.
        expiraEm: expiraEm,
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino entrar e devolvo o controle a quem chamou.

// Leio a credencial recebida, procuro sua sessão no banco e confiro prazo e bloqueios antes de aceitar o acesso.
export async function conferirSessao(cabecalho) {
    // Aceito apenas o token de uma sessão criada pelo servidor, nunca CPF ou ID do aparelho.
    if (typeof cabecalho !== 'string' || !/^Bearer [a-f0-9]{64}$/.test(cabecalho)) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(401, 'Entre na sua conta para continuar.');
    } // Encerro a conferência de esta condição.
    // Preparo resumo com esta chamada. Chamo resumirToken em senha.js. Nesse passo, transformo o token aleatório em
    // um resumo para buscar a sessão sem guardar a credencial original no banco.
    const resumo = resumirToken(cabecalho.slice(7));
    // Espero o resultado antes de preencher sessao. Chamo repositorio.buscarSessao em acesso-repositorio.js. Nesse
    // passo, carrego a sessão com conta e aluno para conferir o estado atual de todos os vínculos.
    const sessao = await repositorio.buscarSessao(resumo);
    // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
    if (!sessao || sessao.expiraEm.getTime() <= Date.now()) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(401, 'Sua sessão terminou. Entre novamente.');
    } // Encerro a conferência de esta condição.
    // Guardo conta com sessao.conta para reutilizar esse resultado neste trecho.
    const conta = sessao.conta;
    // Reconfiro os bloqueios para não manter o acesso de um cadastro desativado.
    if (!conta || !conta.ativo || !conta.aluno || !conta.aluno.ativo) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(401, 'Esta conta não está disponível para acesso.');
    } // Encerro a conferência de esta condição.
    // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
    return {
        // Associo os dados à conta conferida no acesso para separar as informações de cada pessoa.
        contaId: conta.id,
        // Informo qual aluno está ligado a este registro.
        alunoId: conta.alunoId,
        // Uso o resumo da credencial para encontrar a sessão sem guardar o token original no banco.
        tokenResumo: resumo,
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino conferirSessao e devolvo o controle a quem chamou.

// Peço ao repositório que apague a sessão atual para o token deixar de permitir acesso.
export function sair(acesso) {
    // Revogo a credencial no servidor para que uma cópia dela também pare de funcionar.
    return repositorio.excluirSessao(acesso.tokenResumo);
} // Termino sair e devolvo o controle a quem chamou.
