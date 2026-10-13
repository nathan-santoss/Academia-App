// Centralizo as chamadas HTTP e traduzo falhas de comunicação em mensagens para as telas.
export async function solicitarApi(caminho, opcoes = {}) {
    // Leio apenas o endereço HTTP público; as credenciais do banco ficam no backend.
    const endereco = process.env.EXPO_PUBLIC_API_URL;

    if (!endereco || !/^https?:\/\//.test(endereco)) {
        throw new Error('Configure EXPO_PUBLIC_API_URL no ambiente do mobile para conectar à API.');
    }

    // Limito a espera para que a tela não permaneça carregando indefinidamente.
    const controle = new AbortController();
    const tempo = setTimeout(function encerrarEspera() {
        controle.abort();
    }, 15000);

    let resposta;

    try {
        // Envio as solicitações sem senha ou chave nos cabeçalhos.
        resposta = await fetch(endereco.replace(/\/+$/, '') + caminho, {
            ...opcoes,
            signal: controle.signal,
        });

        // Leio o JSON ainda dentro do tempo de espera definido para a chamada.
        const resultado = await resposta.json();

        if (!resposta.ok) {
            let mensagem = 'Não foi possível concluir a solicitação.';

            if (resultado && typeof resultado.mensagem === 'string') {
                mensagem = resultado.mensagem;
            }

            throw new Error(mensagem);
        }

        return resultado;
    } catch (falha) {
        // Informo uma resposta incerta sem reenviar automaticamente um cadastro.
        if (controle.signal.aborted) {
            throw new Error('A resposta demorou mais que o esperado. Se estava cadastrando, consulte a lista antes de reenviar.');
        }

        if (!resposta) {
            throw new Error('Não foi possível conectar à API. Confira a rede e se o backend está ligado. Se estava cadastrando, consulte a lista antes de reenviar.');
        }

        if (falha instanceof SyntaxError) {
            throw new Error('A API enviou uma resposta inválida. Confira o endereço configurado.');
        }

        // Preservo as mensagens de validação devolvidas pelo backend.
        throw falha;
    } finally {
        clearTimeout(tempo);
    }
}
