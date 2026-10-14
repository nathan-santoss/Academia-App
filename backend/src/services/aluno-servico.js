// Valido cadastros e consulto os alunos diretamente nos repositórios do Neon.
// Recebo o pedido do controlador, aplico as regras e chamo os repositórios para acessar o Neon. Devolvo o resultado
// ao controlador para ele responder à tela. Sou usado por acesso-controlador.js, aluno-controlador.js.

import { validarCadastroAluno, prepararCadastroAluno } from '../utils/validar-aluno.js';
import { prepararConsultaAlunos } from '../utils/validar-consulta-aluno.js';
import { apresentarAluno, apresentarResumoAluno } from '../utils/formatar-aluno.js';
import { registrarOperacao } from './persistencia-servico.js';
import * as alunos from '../repositories/aluno-repositorio.js';
import { exigirId, obterIdOperacao } from '../utils/validar-id.js';
import { idPessoa } from '../utils/id-pessoa.js';
import { erroOperacao } from '../utils/erro-operacao.js';

// Valido e preparo o aluno antes de enviar a operação à persistência; este caminho da equipe continua bloqueado na
// rota.
export async function cadastrarAluno(entrada, operacaoId) {
    // Peço à validação uma mensagem de erro; se ela vier vazia, posso seguir com o cadastro.
    const mensagem = validarCadastroAluno(entrada);

    // Interrompo com throw quando há um problema, para não deixar dados inválidos chegarem ao banco.
    if (mensagem) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, mensagem);
    } // Encerro a conferência de mensagem.

    // Aproveito o ID que o cliente mandou ou gero um novo, já que o mobile pode enviar só os dados do aluno.
    const id = obterIdOperacao(operacaoId);
    // Organizo CPF, telefone e outros campos antes de salvar, para manter um formato só no banco.
    const dados = prepararCadastroAluno(entrada);

    // Aguardo a matrícula gerada pela sequência do Neon antes de confirmar o cadastro.
    return registrarOperacao(id, 'salvar', {
        // Informo qual grupo de registros participa desta consulta ou gravação.
        categoria: 'aluno',
        // Informo o identificador deste registro para conseguir encontrá-lo depois.
        id: id,
        // Derivo o ID da pessoa a partir do pedido para ele continuar igual quando houver um reenvio.
        pessoaId: idPessoa(id),
        // Reúno o conteúdo desta operação em dados para manter o formato esperado por quem recebe.
        dados: dados,
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino cadastrarAluno e devolvo o controle a quem chamou.

// Valido os filtros da consulta, peço a página ao repositório e preparo os dados e a paginação da resposta.
export async function listarAlunos(consulta) {
    // Confiro paginação e busca primeiro, porque estes valores vieram da URL e ainda podem estar errados.
    const filtros = prepararConsultaAlunos(consulta);

    // Recuso a consulta se a preparação encontrou um problema nos filtros.
    if (filtros.mensagem) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, filtros.mensagem);
    } // Encerro a conferência de filtros.mensagem.

    // Deixo a busca e a paginação no banco para não carregar todos os cadastros.
    const resultado = await alunos.listarAlunos(filtros);

    // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
    return {
        // Uso map para transformar cada registro do banco no resumo que a lista de alunos precisa.
        dados: resultado.rows.map(apresentarResumoAluno),
        // Informo a página usada para calcular de onde a consulta deve começar.
        pagina: filtros.pagina,
        // Devolvo a quantidade total de registros encontrados, além dos itens desta página.
        total: resultado.count,
        // Arredondo para cima com ceil: se sobra um aluno depois de uma página cheia, preciso de outra página.
        totalPaginas: Math.ceil(resultado.count / filtros.limite),
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino listarAlunos e devolvo o controle a quem chamou.

// Valido o ID, busco o aluno no repositório e preparo seus dados; se ele não existir, devolvo uma falha de consulta.
export async function buscarAluno(id) {
    // Valido o UUID antes da consulta para não mandar um identificador malformado ao PostgreSQL.
    const aluno = await alunos.buscarAlunoPorId(exigirId(id));

    // Devolvo 404 quando a consulta terminou normalmente, mas não encontrou esse cadastro.
    if (!aluno) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(404, 'Aluno não encontrado.');
    } // Encerro a conferência de aluno.

    // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
    return {
        // Reúno o conteúdo desta operação em dados para manter o formato esperado por quem recebe.
        dados: apresentarAluno(aluno),
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino buscarAluno e devolvo o controle a quem chamou.
