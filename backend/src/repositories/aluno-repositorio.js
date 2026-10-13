// Concentro as consultas e gravações de alunos e pessoas realizadas pelo Sequelize.
import { Op, UniqueConstraintError } from 'sequelize';
import banco from '../config/banco.js';
import Pessoa from '../models/pessoa.js';
import Aluno from '../models/aluno.js';

export async function salvarAluno(dados) {
    // Uno as gravações para não deixar uma pessoa sem perfil se o cadastro falhar.
    const transacao = await banco.transaction();

    try {
        // Gravo os dados pessoais antes de criar o perfil que depende dessa pessoa.
        const pessoa = await Pessoa.create({
            nome: dados.nome,
            cpf: dados.cpf,
            dataNascimento: dados.dataNascimento,
            email: dados.email,
            telefone: dados.telefone,
        }, {
            transaction: transacao,
        });

        // Vinculo o aluno ao ID recém-criado e deixo o banco gerar a matrícula.
        const aluno = await Aluno.create({
            pessoaId: pessoa.id,
            fotoUrl: dados.fotoUrl,
            contatoEmergencia: dados.contatoEmergencia,
        }, {
            transaction: transacao,
        });

        // Junto a pessoa ao resultado para evitar uma consulta adicional.
        aluno.pessoa = pessoa;
        // Confirmo as duas gravações somente depois que ambas foram concluídas.
        await transacao.commit();

        return aluno;
    } catch (falha) {
        // Desfaço as gravações apenas se a transação ainda não foi encerrada.
        if (!transacao.finished) {
            await transacao.rollback();
        }

        // Reconheço o CPF pelo campo do erro, mesmo que o banco dê outro nome à restrição.
        if (falha instanceof UniqueConstraintError && falha.fields) {
            if (falha.fields.cpf !== undefined) {
                // Devolvo null para o serviço informar que esse CPF já está cadastrado.
                return null;
            }
        }

        // Encaminho as demais falhas ao tratamento de erros do app.
        throw falha;
    }
}

export async function listarAlunos(filtros) {
    // Separo os filtros do perfil daqueles que pertencem aos dados pessoais.
    const filtroAluno = {};
    const filtroPessoa = {};

    // Procuro a matrícula completa quando ela foi informada no formato esperado.
    if (/^A\d{1,19}$/i.test(filtros.busca)) {
        // Retiro a letra A e preservo números grandes sem perder precisão.
        filtroAluno.numeroMatricula = BigInt(filtros.busca.slice(1)).toString();
    } else if (filtros.busca) {
        // Escapo os curingas para pesquisar % e _ como caracteres comuns.
        const nome = filtros.busca.replace(/[\\%_]/g, '\\$&');

        filtroPessoa.nome = {
            [Op.iLike]: '%' + nome + '%',
        };
    }

    // Reúno os alunos da página e a contagem total em uma chamada do Sequelize.
    return Aluno.findAndCountAll({
        where: filtroAluno,
        // Consulto apenas os campos do resumo usado na lista, sem carregar o cadastro completo.
        attributes: ['id', 'numeroMatricula', 'ativo', 'criadoEm'],
        // Incluo a pessoa vinculada para obter o nome e aplicar a busca textual.
        include: [{
            model: Pessoa,
            as: 'pessoa',
            where: filtroPessoa,
            attributes: ['nome'],
        }],
        // Pulo os registros das páginas anteriores e limito o tamanho da resposta.
        limit: filtros.limite,
        offset: (filtros.pagina - 1) * filtros.limite,
        // Ordeno pela matrícula para manter a sequência da listagem entre páginas.
        order: [['numeroMatricula', 'ASC']],
    });
}

export async function buscarAlunoPorId(id) {
    // Consulto o perfil junto da pessoa vinculada para obter o cadastro completo.
    return Aluno.findByPk(id, {
        include: [{
            model: Pessoa,
            as: 'pessoa',
        }],
    });
}
