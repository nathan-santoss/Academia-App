// Valido cadastros e consulto os alunos diretamente nos repositórios do Neon.
import { validarCadastroAluno, prepararCadastroAluno } from '../utils/validar-aluno.js';
import { prepararConsultaAlunos } from '../utils/validar-consulta-aluno.js';
import { apresentarAluno, apresentarResumoAluno } from '../utils/formatar-aluno.js';
import { registrarOperacao } from './persistencia-servico.js';
import * as alunos from '../repositories/aluno-repositorio.js';
import { exigirId, obterIdOperacao } from '../utils/validar-id.js';
import { idPessoa } from '../utils/id-pessoa.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function cadastrarAluno(entrada, operacaoId) {
    const mensagem = validarCadastroAluno(entrada);

    if (mensagem) {
        throw erroOperacao(422, mensagem);
    }

    const id = obterIdOperacao(operacaoId);
    const dados = prepararCadastroAluno(entrada);

    // Aguardo a matrícula gerada pela sequência do Neon antes de confirmar o cadastro.
    return registrarOperacao(id, 'salvar', {
        categoria: 'aluno',
        id: id,
        pessoaId: idPessoa(id),
        dados: dados,
    });
}

export async function listarAlunos(consulta) {
    const filtros = prepararConsultaAlunos(consulta);

    if (filtros.mensagem) {
        throw erroOperacao(422, filtros.mensagem);
    }

    // Deixo a busca e a paginação no banco para não carregar todos os cadastros.
    const resultado = await alunos.listarAlunos(filtros);

    return {
        dados: resultado.rows.map(apresentarResumoAluno),
        pagina: filtros.pagina,
        total: resultado.count,
        totalPaginas: Math.ceil(resultado.count / filtros.limite),
    };
}

export async function buscarAluno(id) {
    const aluno = await alunos.buscarAlunoPorId(exigirId(id));

    if (!aluno) {
        throw erroOperacao(404, 'Aluno não encontrado.');
    }

    return {
        dados: apresentarAluno(aluno),
    };
}
