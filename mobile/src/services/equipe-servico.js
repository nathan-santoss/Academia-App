// Reúno os endereços usados pela equipe para as telas não precisarem montar cada pedido HTTP.
// Aproveito o serviço da API para enviar o login e receber as mensagens de erro do backend.
import { solicitarApi } from './api';

export function consultarPapeis() {
    return solicitarApi('/equipe/papeis');
}

export function buscarAlunos(busca) {
    return solicitarApi('/equipe/alunos?busca=' + encodeURIComponent(busca));
}

export function consultarFicha(alunoId) {
    return solicitarApi('/equipe/alunos/' + alunoId + '/ficha');
}

export function consultarExecucoes(alunoId, pagina = 0) {
    // Peço só a página em consulta; assim, o instrutor também consegue acessar os treinos mais antigos.
    return solicitarApi('/equipe/alunos/' + alunoId + '/treinos?pagina=' + pagina);
}

export function consultarChegadaAluno(alunoId) {
    return solicitarApi('/equipe/alunos/' + alunoId + '/chegada');
}

export function enviarAcao(alunoId, acao, dados, metodo = 'POST') {
    return solicitarApi('/equipe/alunos/' + alunoId + '/' + acao, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    });
}
