// Centralizo as chamadas HTTP e traduzo falhas de comunicação em mensagens para as telas.
import { obterToken } from './token-servico';

// Aviso o contexto quando uma sessão perde a validade, sem misturar navegação com HTTP.
let avisarFimDaSessao = async function aguardarContexto() {};

export function acompanharSessao(funcao) {
    avisarFimDaSessao = funcao;
}

export async function solicitarApi(caminho, opcoes = {}, protegido = true) {
    // Leio apenas o endereço HTTP público; as credenciais do banco ficam no backend.
    const endereco = process.env.EXPO_PUBLIC_API_URL;

    if (!endereco || !/^https?:\/\//.test(endereco)) {
        throw new Error('Configure EXPO_PUBLIC_API_URL no ambiente do mobile para conectar à API.');
    }

    // Acrescento somente a credencial do usuário; nenhuma senha de desenvolvimento é necessária.
    let token = null;
    const cabecalhos = Object.assign({}, opcoes.headers);
    if (protegido) {
        token = await obterToken();
        if (token) {
            cabecalhos.Authorization = 'Bearer ' + token;
        }
    }

    // Dou tempo para o Render despertar após um período sem uso, sem esperar para sempre.
    const controle = new AbortController();
    const tempo = setTimeout(function encerrarEspera() {
        controle.abort();
    }, 60000);

    let resposta;

    try {
        // Reaproveito os cabeçalhos específicos do pedido e acrescento a sessão.
        resposta = await fetch(endereco.replace(/\/+$/, '') + caminho, Object.assign({}, opcoes, {
            signal: controle.signal,
            headers: cabecalhos,
        }));

        // Aceito a resposta vazia de logout sem tentar interpretá-la como JSON.
        if (resposta.status === 204) {
            return null;
        }

        // Leio o JSON ainda dentro do tempo de espera definido para a chamada.
        const resultado = await resposta.json();

        if (!resposta.ok) {
            // Não deixo uma resposta antiga encerrar um login mais recente.
            if (resposta.status === 401 && protegido && token === await obterToken()) {
                await avisarFimDaSessao();
            }
            let mensagem = 'Não foi possível concluir a solicitação.';

            if (resultado && typeof resultado.mensagem === 'string') {
                mensagem = resultado.mensagem;
            }

            throw Object.assign(new Error(mensagem), {
                status: resposta.status,
            });
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
