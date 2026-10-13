// Reúno os endereços e dados enviados à API nas operações de alunos.
import { solicitarApi } from './api.js';

export function listarAlunos(pagina, busca) {
    // Protejo os caracteres da busca antes de colocá-los na URL.
    const filtros = '?pagina=' + pagina + '&busca=' + encodeURIComponent(busca);
    return solicitarApi('/alunos' + filtros);
}

export function buscarAluno(id) {
    // Consulto o registro atual pelo identificador técnico retornado pela API.
    return solicitarApi('/alunos/' + encodeURIComponent(id));
}

export function cadastrarAluno(dados) {
    // Envio apenas os campos do formulário; matrícula e ID são gerados no backend.
    return solicitarApi('/alunos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    });
}
