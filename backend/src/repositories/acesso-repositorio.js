// Consulto as contas e as sessões no Neon, sem expor senhas nas respostas da API.
// Recebo as decisões do serviço de acesso e uso os modelos Conta, Sessao e Aluno para falar com o Neon. No cadastro,
// junto pessoa, aluno e conta na mesma transação para não deixar uma criação pela metade.

import Conta from '../models/conta.js';
import Sessao from '../models/sessao.js';
import Aluno from '../models/aluno.js';
import banco from '../config/banco.js';
import { gravarAluno } from './operacao-online.js';

// Abro uma transação para criar pessoa, aluno e conta juntos, sem deixar um cadastro incompleto no banco.
export function criarConta(entrada, senhaProtegida) {
    // Salvo pessoa, aluno e conta juntos: se qualquer etapa falhar, desfaço o cadastro inteiro.
    return banco.transaction(async function cadastrar(transacao) {
        // Espero o resultado antes de preencher aluno. Chamo gravarAluno em operacao-online.js. Nesse passo, salvo
        // primeiro a pessoa e depois seu perfil de aluno, usando a transação que recebi para confirmar os dois
        // juntos.
        const aluno = await gravarAluno(entrada, transacao);
        // Espero esta tarefa terminar antes de continuar. Peço ao modelo que crie um registro com os dados
        // informados.
        await Conta.create({
            // Preencho o e-mail com o valor preparado para este cadastro ou consulta.
            email: aluno.email,
            // Informo qual aluno está ligado a este registro.
            alunoId: aluno.id,
            // Gravo o resultado do cálculo da senha, mantendo o texto original fora do banco.
            senhaProtegida: senhaProtegida,
        }, { // Concluo este objeto com os campos que a etapa atual precisa.
            // Uso a mesma transação recebida para esta consulta ou gravação participar da confirmação conjunta.
            transaction: transacao,
        }); // Concluo este objeto com os campos que a etapa atual precisa.
    }); // Termino cadastrar e devolvo o controle a quem chamou.
} // Termino criarConta e devolvo o controle a quem chamou.

// Procuro a conta pelo e-mail normalizado e trago o aluno junto para conferir seu vínculo.
export function buscarContaPorEmail(email) {
    // Procuro o e-mail normalizado e junto o aluno para conferir se o vínculo está ativo. Peço ao Sequelize um único
    // registro que combine com o filtro.
    return Conta.findOne({
        // Monto as condições que limitam quais registros o banco pode consultar ou alterar.
        where: {
            // Preencho o e-mail com o valor preparado para este cadastro ou consulta.
            email: email,
        }, // Concluo os campos de where e volto ao objeto que reúne essa configuração.
        // Peço os modelos relacionados junto com o registro principal para receber os dados necessários nessa
        // consulta.
        include: [{
            // Indico o modelo que o Sequelize deve buscar junto com o registro principal.
            model: Aluno,
            // Dou um nome à relação para acessar o registro relacionado pelo mesmo nome nas consultas.
            as: 'aluno',
        }], // Concluo este objeto com os campos que a etapa atual precisa.
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino buscarContaPorEmail e devolvo o controle a quem chamou.

// Gravo a conta, o resumo do token e sua validade; o token original fica fora desta tabela.
export function salvarSessao(dados) {
    // Registro o resumo do token, a conta e a validade calculada pelo serviço.
    return Sessao.create(dados);
} // Termino salvarSessao e devolvo o controle a quem chamou.

// Carrego a sessão com conta e aluno para conferir o estado atual de todos os vínculos.
export function buscarSessao(tokenResumo) {
    // Releio os vínculos a cada acesso para respeitar um bloqueio feito depois do login.
    return Sessao.findByPk(tokenResumo, {
        // Peço os modelos relacionados junto com o registro principal para receber os dados necessários nessa
        // consulta.
        include: [{
            // Indico o modelo que o Sequelize deve buscar junto com o registro principal.
            model: Conta,
            // Dou um nome à relação para acessar o registro relacionado pelo mesmo nome nas consultas.
            as: 'conta',
            // Peço os modelos relacionados junto com o registro principal para receber os dados necessários nessa
            // consulta.
            include: [{
                // Indico o modelo que o Sequelize deve buscar junto com o registro principal.
                model: Aluno,
                // Dou um nome à relação para acessar o registro relacionado pelo mesmo nome nas consultas.
                as: 'aluno',
            }], // Concluo este objeto com os campos que a etapa atual precisa.
        }], // Concluo este objeto com os campos que a etapa atual precisa.
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino buscarSessao e devolvo o controle a quem chamou.

// Apago a sessão indicada pelo resumo; assim, a credencial deixa de funcionar também no servidor.
export function excluirSessao(tokenResumo) {
    // Apago só a sessão usada neste aparelho; outras sessões continuam independentes.
    return Sessao.destroy({
        // Monto as condições que limitam quais registros o banco pode consultar ou alterar.
        where: {
            // Uso o resumo da credencial para encontrar a sessão sem guardar o token original no banco.
            tokenResumo: tokenResumo,
        }, // Concluo os campos de where e volto ao objeto que reúne essa configuração.
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino excluirSessao e devolvo o controle a quem chamou.
