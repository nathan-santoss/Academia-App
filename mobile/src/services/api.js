import { obterToken } from './token-servico';
import { interpretarResposta, normalizarEndereco } from '../utils/resposta-api';

let avisarFimDaSessao = async function aguardarContexto() {};

export function acompanharSessao(funcao) {
    avisarFimDaSessao = funcao;
}

export async function solicitarApi(caminho, opcoes = {}, protegido = true) {
    const endereco = normalizarEndereco(process.env.EXPO_PUBLIC_API_URL);
    let token = null;
    const cabecalhos = Object.assign({
        Accept: 'application/json',
    }, opcoes.headers);
    if (opcoes.body && !cabecalhos['Content-Type']) {
        cabecalhos['Content-Type'] = 'application/json';
    }
    if (protegido) {
        token = await obterToken();
        if (token) {
            cabecalhos.Authorization = 'Bearer ' + token;
        }
    }
    const controle = new AbortController();
    const tempo = setTimeout(function encerrarEspera() {
        controle.abort();
    }, 60000);
    let resposta;
    try {
        resposta = await fetch(endereco + caminho, Object.assign({}, opcoes, {
            signal: controle.signal,
            headers: cabecalhos,
        }));
        // Trato a sessão pelo status mesmo quando o proxy devolve HTML em vez de JSON.
        if (resposta.status === 401 && protegido && token && token === await obterToken()) {
            await avisarFimDaSessao();
        }
        if (resposta.status === 204) {
            return null;
        }
        return interpretarResposta(await resposta.text(), resposta.status, resposta.ok);
    } catch (falha) {
        if (controle.signal.aborted) {
            throw new Error('A resposta demorou mais que o esperado. Consulte os dados antes de reenviar uma gravação.');
        }
        if (!resposta) {
            throw new Error('Não foi possível conectar à API. Confira a rede e o endereço do backend. Se estava gravando, consulte o resultado antes de reenviar.');
        }
        throw falha;
    } finally {
        clearTimeout(tempo);
    }
}
