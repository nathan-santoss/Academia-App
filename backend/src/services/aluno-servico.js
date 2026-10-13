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
    // Peço à validação uma mensagem de erro; se ela vier vazia, posso seguir com o cadastro.
    const mensagem = validarCadastroAluno(entrada);

    // Interrompo com throw quando há um problema, para não deixar dados inválidos chegarem ao banco.
    if (mensagem) {
        throw erroOperacao(422, mensagem);
    }

    // Aproveito o ID que o cliente mandou ou gero um novo, já que o mobile pode enviar só os dados do aluno.
    const id = obterIdOperacao(operacaoId);
    // Organizo CPF, telefone e outros campos antes de salvar, para manter um formato só no banco.
    const dados = prepararCadastroAluno(entrada);

    // Aguardo a matrícula gerada pela sequência do Neon antes de confirmar o cadastro.
    return registrarOperacao(id, 'salvar', {
        categoria: 'aluno',
        id: id,
        // Derivo o ID da pessoa a partir do pedido para ele continuar igual quando houver um reenvio.
        pessoaId: idPessoa(id),
        dados: dados,
    });
}

export async function listarAlunos(consulta) {
    // Confiro paginação e busca primeiro, porque estes valores vieram da URL e ainda podem estar errados.
    const filtros = prepararConsultaAlunos(consulta);

    if (filtros.mensagem) {
        throw erroOperacao(422, filtros.mensagem);
    }

    // Deixo a busca e a paginação no banco para não carregar todos os cadastros.
    const resultado = await alunos.listarAlunos(filtros);

    return {
        // Uso map para transformar cada registro do banco no resumo que a lista de alunos precisa.
        dados: resultado.rows.map(apresentarResumoAluno),
        pagina: filtros.pagina,
        total: resultado.count,
        // Arredondo para cima com ceil: se sobra um aluno depois de uma página cheia, preciso de outra página.
        totalPaginas: Math.ceil(resultado.count / filtros.limite),
    };
}

export async function buscarAluno(id) {
    // Valido o UUID antes da consulta para não mandar um identificador malformado ao PostgreSQL.
    const aluno = await alunos.buscarAlunoPorId(exigirId(id));

    // Devolvo 404 quando a consulta terminou normalmente, mas não encontrou esse cadastro.
    if (!aluno) {
        throw erroOperacao(404, 'Aluno não encontrado.');
    }

    return {
        dados: apresentarAluno(aluno),
    };
}
