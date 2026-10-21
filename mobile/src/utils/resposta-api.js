export function interpretarResposta(texto, status, sucesso) {
    let resultado = null;
    if (texto.trim()) {
        try {
            resultado = JSON.parse(texto);
        } catch {
            if (sucesso) {
                throw Object.assign(new Error('A API enviou uma resposta inválida. Confira o endereço configurado.'), {
                    status: status,
                });
            }
        }
    }
    if (!sucesso) {
        let mensagem = 'Não foi possível concluir a solicitação.';
        if (status === 401) {
            mensagem = 'Sua sessão terminou. Entre novamente.';
        } else if (status === 429) {
            mensagem = 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.';
        } else if (status >= 500) {
            mensagem = 'O servidor está indisponível. Consulte o resultado antes de reenviar uma gravação.';
        }
        if (resultado && typeof resultado.mensagem === 'string') {
            mensagem = resultado.mensagem;
        }
        throw Object.assign(new Error(mensagem), {
            status: status,
        });
    }
    if (resultado === null && status !== 204) {
        throw Object.assign(new Error('A API retornou uma resposta vazia inesperada.'), {
            status: status,
        });
    }
    return resultado;
}

export function normalizarEndereco(endereco) {
    if (typeof endereco !== 'string' || !endereco.trim()) {
        throw new Error('Configure EXPO_PUBLIC_API_URL para conectar à API.');
    }
    let url;
    try {
        url = new URL(endereco.trim());
    } catch {
        throw new Error('Confira o endereço HTTP ou HTTPS configurado para a API.');
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        throw new Error('Use o endereço público HTTP ou HTTPS da API, sem credenciais.');
    }
    let base = url.href.replace(/\/+$/, '');
    if (!url.pathname.replace(/\/+$/, '')) {
        base += '/api/v1';
    } else if (url.pathname.replace(/\/+$/, '') !== '/api/v1') {
        throw new Error('EXPO_PUBLIC_API_URL deve terminar em /api/v1 ou conter somente o domínio da API.');
    }
    return base;
}
