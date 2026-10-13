// Valido os cadastros e consulto alunos pelo serviço que coordena Neon e cache do backend.
import { validarCadastroAluno, prepararCadastroAluno } from '../utils/validar-aluno.js';
import { prepararConsultaAlunos } from '../utils/validar-consulta-aluno.js';
import { consultarRegistros, registrarOperacao } from './persistencia-servico.js';
import { exigirId } from '../utils/validar-id.js';
import { idPessoa } from '../utils/id-pessoa.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function cadastrarAluno(entrada, operacaoId) {
    const mensagem = validarCadastroAluno(entrada);

    if (mensagem) {
        throw erroOperacao(422, mensagem);
    }

    exigirId(operacaoId);
    const dados = prepararCadastroAluno(entrada);
    const pessoaId = idPessoa(operacaoId);
    const previa = Object.assign({}, dados, {
        id: operacaoId,
        pessoaId: pessoaId,
        matricula: null,
        ativo: false,
        criadoEm: null,
        atualizadoEm: null,
        pendenteSincronizacao: true,
    });

    // Só apresento matrícula definitiva depois da confirmação pela sequência do Neon.
    return registrarOperacao(operacaoId, 'salvar', {
        categoria: 'aluno',
        id: operacaoId,
        pessoaId: pessoaId,
        dados: dados,
    }, previa);
}

export async function listarAlunos(consulta) {
    const filtros = prepararConsultaAlunos(consulta);

    if (filtros.mensagem) {
        throw erroOperacao(422, filtros.mensagem);
    }

    const resultado = await consultarRegistros('aluno');
    let busca = filtros.busca.toLowerCase();

    if (/^a\d{1,19}$/.test(busca)) {
        busca = 'a' + BigInt(busca.slice(1)).toString().padStart(6, '0');
    }

    const encontrados = resultado.dados.filter(function corresponde(aluno) {
        if (!busca) {
            return true;
        }

        if (/^a\d+$/.test(busca)) {
            return aluno.matricula && aluno.matricula.toLowerCase() === busca;
        }

        return aluno.nome.toLowerCase().includes(busca);
    });
    const inicio = (filtros.pagina - 1) * filtros.limite;

    return {
        dados: encontrados.slice(inicio, inicio + filtros.limite).map(function resumir(aluno) {
            return {
                id: aluno.id,
                nome: aluno.nome,
                matricula: aluno.matricula,
                ativo: aluno.ativo,
                criadoEm: aluno.criadoEm,
                pendenteSincronizacao: aluno.pendenteSincronizacao,
            };
        }),
        pagina: filtros.pagina,
        total: encontrados.length,
        totalPaginas: Math.ceil(encontrados.length / filtros.limite),
        persistencia: resultado.persistencia,
    };
}

export async function buscarAluno(id) {
    exigirId(id);
    const resultado = await consultarRegistros('aluno');
    const aluno = resultado.dados.find(function encontrar(registro) {
        return registro.id === id;
    });

    if (!aluno) {
        if (!resultado.persistencia.online) {
            throw erroOperacao(503, 'Este cadastro não está na cópia local. Aguarde a conexão com o Neon.');
        }

        throw erroOperacao(404, 'Aluno não encontrado.');
    }

    return {
        dados: aluno,
        persistencia: resultado.persistencia,
    };
}
