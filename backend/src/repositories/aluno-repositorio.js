// Consulto alunos e pessoas diretamente nos modelos do Neon.
import { Op } from 'sequelize';
import Pessoa from '../models/pessoa.js';
import Aluno from '../models/aluno.js';

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
