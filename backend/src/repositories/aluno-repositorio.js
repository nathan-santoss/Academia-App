// Consulto alunos e pessoas diretamente nos modelos do Neon.
// Recebo os pedidos do serviço e uso os modelos do Sequelize para acessar o Neon. Devolvo os registros para o serviço
// preparar a resposta. Sou usado por aluno-servico.js.

import { Op } from 'sequelize';
import Pessoa from '../models/pessoa.js';
import Aluno from '../models/aluno.js';

// Monto a busca, a ordem e os limites no Sequelize e incluo a pessoa para montar cada resumo de aluno.
export async function listarAlunos(filtros) {
    // Separo os filtros do perfil daqueles que pertencem aos dados pessoais.
    const filtroAluno = {};
    // Monto filtroPessoa como um objeto para agrupar os campos desta etapa.
    const filtroPessoa = {};

    // Uso test para ver se a busca parece uma matrícula, como A000001, antes de tratá-la como nome.
    if (/^A\d{1,19}$/i.test(filtros.busca)) {
        // Tiro o A com slice e uso BigInt para não arredondar uma matrícula grande sem querer.
        filtroAluno.numeroMatricula = BigInt(filtros.busca.slice(1)).toString();
    // Confiro se filtros.busca está disponível ou está verdadeiro antes de executar o bloco abaixo.
    } else if (filtros.busca) {
        // Coloco uma barra antes de %, _ e da própria barra, para eu buscar esses caracteres como texto.
        const nome = filtros.busca.replace(/[\\%_]/g, '\\$&');

        // Atualizo filtroPessoa.nome com um objeto com os campos abaixo.
        filtroPessoa.nome = {
            // Uso iLike para procurar o nome sem diferenciar maiúsculas e minúsculas; os % permitem encontrar um
            // trecho.
            [Op.iLike]: '%' + nome + '%',
        }; // Concluo este objeto com os campos que a etapa atual precisa.
    } // Encerro a conferência de filtros.busca.

    // Peço ao findAndCountAll os registros da página e o total encontrado, para montar a paginação.
    return Aluno.findAndCountAll({
        // Monto as condições que limitam quais registros o banco pode consultar ou alterar.
        where: filtroAluno,
        // Consulto apenas os campos do resumo usado na lista, sem carregar o cadastro completo.
        attributes: ['id', 'numeroMatricula', 'ativo', 'criadoEm'],
        // Incluo a pessoa vinculada para obter o nome e aplicar a busca textual.
        include: [{
            // Indico o modelo que o Sequelize deve buscar junto com o registro principal.
            model: Pessoa,
            // Dou um nome à relação para acessar o registro relacionado pelo mesmo nome nas consultas.
            as: 'pessoa',
            // Monto as condições que limitam quais registros o banco pode consultar ou alterar.
            where: filtroPessoa,
            // Escolho quais colunas preciso trazer, evitando carregar dados que esta resposta não usa.
            attributes: ['nome'],
        }], // Concluo este objeto com os campos que a etapa atual precisa.
        // Uso limit para escolher quantos trazer e offset para pular os alunos das páginas anteriores.
        limit: filtros.limite,
        // Pulo os registros das páginas anteriores para buscar só a página solicitada.
        offset: (filtros.pagina - 1) * filtros.limite,
        // Ordeno pela matrícula para manter a sequência da listagem entre páginas.
        order: [['numeroMatricula', 'ASC']],
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino listarAlunos e devolvo o controle a quem chamou.

// Consulto um único perfil e incluo sua pessoa, reunindo os dados necessários à resposta.
export async function buscarAlunoPorId(id) {
    // Busco pelo ID com findByPk e uso include para trazer também a pessoa ligada a esse aluno.
    return Aluno.findByPk(id, {
        // Peço os modelos relacionados junto com o registro principal para receber os dados necessários nessa
        // consulta.
        include: [{
            // Indico o modelo que o Sequelize deve buscar junto com o registro principal.
            model: Pessoa,
            // Dou um nome à relação para acessar o registro relacionado pelo mesmo nome nas consultas.
            as: 'pessoa',
        }], // Concluo este objeto com os campos que a etapa atual precisa.
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino buscarAlunoPorId e devolvo o controle a quem chamou.
