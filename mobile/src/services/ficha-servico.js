import { solicitarApi } from './api';

export function listarModelos(pagina = 0) {
    return solicitarApi('/modelos-treino?pagina=' + pagina);
}
export function salvarModelo(id, dados) {
    return solicitarApi('/modelos-treino/' + id, {
        method: 'PUT',
        body: JSON.stringify(dados),
    });
}
export function listarVersoes(alunoId, pagina = 0) {
    return solicitarApi('/equipe/alunos/' + alunoId + '/ficha/versoes?pagina=' + pagina);
}
export function restaurarVersao(alunoId, id, revisao, versaoBase) {
    return solicitarApi('/equipe/alunos/' + alunoId + '/ficha/versoes/' + id + '/restaurar', {
        method: 'POST',
        body: JSON.stringify({
            revisao: revisao,
            versaoBase: versaoBase,
        }),
    });
}
