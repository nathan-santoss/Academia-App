// Consulto alunos e pessoas diretamente nos modelos do Neon.
import { Op } from 'sequelize';
import Pessoa from '../models/pessoa.js';
import Aluno from '../models/aluno.js';

export async function listarAlunos(filtros) {
    // Separo os filtros do perfil daqueles que pertencem aos dados pessoais.
    const filtroAluno = {};
    const filtroPessoa = {};

    // Uso test para ver se a busca parece uma matrícula, como A000001, antes de tratá-la como nome.
    if (/^A\d{1,19}$/i.test(filtros.busca)) {
        // Tiro o A com slice e uso BigInt para não arredondar uma matrícula grande sem querer.
        filtroAluno.numeroMatricula = BigInt(filtros.busca.slice(1)).toString();
    } else if (filtros.busca) {
        // Coloco uma barra antes de %, _ e da própria barra, para eu buscar esses caracteres como texto.
        const nome = filtros.busca.replace(/[\\%_]/g, '\\$&');

        filtroPessoa.nome = {
            // Uso iLike para procurar o nome sem diferenciar maiúsculas e minúsculas; os % permitem encontrar um trecho.
            [Op.iLike]: '%' + nome + '%',
        };
    }

    // Peço ao findAndCountAll os registros da página e o total encontrado, para montar a paginação.
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
        // Uso limit para escolher quantos trazer e offset para pular os alunos das páginas anteriores.
        limit: filtros.limite,
        offset: (filtros.pagina - 1) * filtros.limite,
        // Ordeno pela matrícula para manter a sequência da listagem entre páginas.
        order: [['numeroMatricula', 'ASC']],
    });
}

export async function buscarAlunoPorId(id) {
    // Busco pelo ID com findByPk e uso include para trazer também a pessoa ligada a esse aluno.
    return Aluno.findByPk(id, {
        include: [{
            model: Pessoa,
            as: 'pessoa',
        }],
    });
}
