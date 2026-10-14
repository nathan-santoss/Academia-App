import { solicitarApi } from './api';

export function consultarRotinas() {
    return solicitarApi('/treinos/rotinas');
}

export function salvarRotina(dados) {
    return solicitarApi('/treinos/rotinas/pessoal', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    });
}

export function consultarTreinoAtivo() {
    return solicitarApi('/treinos/ativo');
}

export function consultarTreino(id) {
    return solicitarApi('/treinos/' + id);
}

export function iniciarTreino(dados) {
    return solicitarApi('/treinos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    });
}

export function sincronizarTreino(id, dados) {
    return solicitarApi('/treinos/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    });
}

export function consultarHistorico(pagina = 0) {
    return solicitarApi('/treinos/historico?pagina=' + pagina);
}

export function consultarChegada() {
    return solicitarApi('/treinos/chegada');
}

export function solicitarChegada() {
    return solicitarApi('/treinos/chegada', {
        method: 'POST',
    });
}

export function consultarConfiguracao() {
    return solicitarApi('/treinos/configuracao');
}

export function iniciarDemonstracao(dados) {
    return solicitarApi('/treinos/demonstracao', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    });
}
