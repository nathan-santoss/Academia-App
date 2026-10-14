// Centralizo as chamadas HTTP e traduzo falhas de comunicação em mensagens para as telas.
// Recebo o caminho e as opções dos outros serviços do mobile. Acrescento a sessão quando preciso, faço o fetch e leio
// o JSON; devolvo os dados para a tela ou lanço uma mensagem que o catch dela vai mostrar.

import { obterToken } from './token-servico';

// Aviso o contexto quando uma sessão perde a validade, sem misturar navegação com HTTP.
let avisarFimDaSessao = async function aguardarContexto() {};

// Guardo a função do contexto que devo chamar quando uma resposta da API encerrar a sessão.
export function acompanharSessao(funcao) {
    // Atualizo avisarFimDaSessao com funcao.
    avisarFimDaSessao = funcao;
} // Termino acompanharSessao e devolvo o controle a quem chamou.

// Centralizo o pedido HTTP, a sessão, a espera e a leitura da resposta para os outros serviços não repetirem esse
// fluxo.
export async function solicitarApi(caminho, opcoes = {}, protegido = true) {
    // Leio apenas o endereço HTTP público; as credenciais do banco ficam no backend.
    const endereco = process.env.EXPO_PUBLIC_API_URL;

    // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
    if (!endereco || !/^https?:\/\//.test(endereco)) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw new Error('Configure EXPO_PUBLIC_API_URL no ambiente do mobile para conectar à API.');
    } // Encerro a conferência de esta condição.

    // Acrescento somente a credencial do usuário; nenhuma senha de desenvolvimento é necessária.
    let token = null;
    // Preparo cabecalhos com esta chamada. Uso Object.assign para copiar os campos para um objeto; com {} no começo,
    // preservo o objeto original.
    const cabecalhos = Object.assign({}, opcoes.headers);
    // Acrescento a sessão apenas nos pedidos que exigem uma conta conectada.
    if (protegido) {
        // Atualizo token com o resultado aguardado de obterToken. Chamo obterToken em token-servico.js. Nesse passo,
        // leio a credencial no armazenamento protegido do sistema para recuperar o acesso do aparelho.
        token = await obterToken();
        // Incluo Authorization somente quando encontrei uma credencial; a API decidirá se ela ainda é válida.
        if (token) {
            // Atualizo cabecalhos.Authorization com a soma ou junção de o texto "Bearer " e token.
            cabecalhos.Authorization = 'Bearer ' + token;
        } // Encerro a conferência de token.
    } // Encerro a conferência de protegido.

    // Dou tempo para o Render despertar após um período sem uso, sem esperar para sempre.
    const controle = new AbortController();
    let prazo = 60000;
    if (caminho.startsWith('/treinos/') && opcoes.method === 'PUT') {
        prazo = 12000;
    }
    // Cancelo o pedido que ultrapassou o tempo configurado para a tela poder oferecer nova tentativa.
    const tempo = setTimeout(function encerrarEspera() {
        // Interrompo a espera do pedido ligado a este controle.
        controle.abort();
    }, prazo); // Limito a espera sem apagar registros locais ainda não confirmados.

    // Reservo resposta para receber o resultado mais adiante, dentro deste fluxo.
    let resposta;

    // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
    // await.
    try {
        // Reaproveito os cabeçalhos específicos do pedido e acrescento a sessão. Uso Object.assign para copiar os
        // campos para um objeto; com {} no começo, preservo o objeto original.
        resposta = await fetch(endereco.replace(/\/+$/, '') + caminho, Object.assign({}, opcoes, {
            // Ligo o pedido ao AbortController para poder interromper a espera pelo servidor.
            signal: controle.signal,
            // Junto informações do pedido, como formato JSON, sessão e identificador de repetição.
            headers: cabecalhos,
        })); // Concluo este objeto com os campos que a etapa atual precisa.

        // Aceito a resposta vazia de logout sem tentar interpretá-la como JSON.
        if (resposta.status === 204) {
            // Devolvo null para indicar que não há um resultado a entregar neste caminho.
            return null;
        } // Encerro a conferência de resposta.status.

        // Leio o JSON ainda dentro do tempo de espera definido para a chamada. Leio o corpo da resposta como JSON
        // para acessar os campos devolvidos pela API.
        const resultado = await resposta.json();

        // Trato os códigos HTTP fora da faixa de sucesso antes de devolver dados à tela.
        if (!resposta.ok) {
            // Não deixo uma resposta antiga encerrar um login mais recente.
            if (resposta.status === 401 && protegido && token === await obterToken()) {
                // Espero esta tarefa terminar antes de continuar. Aviso o contexto que a sessão terminou para ele
                // limpar o acesso e atualizar as telas.
                await avisarFimDaSessao();
            } // Encerro a conferência de esta condição.
            // Inicio mensagem com a mensagem escrita nesta linha; vou ajustar esse valor conforme as condições
            // abaixo.
            let mensagem = 'Não foi possível concluir a solicitação.';

            // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
            if (resultado && typeof resultado.mensagem === 'string') {
                // Atualizo mensagem com resultado.mensagem.
                mensagem = resultado.mensagem;
            } // Encerro a conferência de resultado.

            // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
            throw Object.assign(new Error(mensagem), {
                // Indico o estado ou código de resposta usado por quem recebe este resultado.
                status: resposta.status,
            }); // Concluo este objeto com os campos que a etapa atual precisa.
        } // Encerro a conferência de resposta.ok.

        // Entrego resultado a quem chamou a função e termino este caminho.
        return resultado;
    // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
    } catch (falha) {
        // Informo uma resposta incerta sem reenviar automaticamente um cadastro.
        if (controle.signal.aborted) {
            // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
            throw new Error('A resposta demorou mais que o esperado. Se estava cadastrando, consulte a lista antes de reenviar.');
        } // Encerro a conferência de controle.signal.aborted.

        // Identifico que nenhuma resposta HTTP chegou, então apresento a orientação de conexão.
        if (!resposta) {
            // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
            throw new Error('Não foi possível conectar à API. Confira a rede e se o backend está ligado. Se estava cadastrando, consulte a lista antes de reenviar.');
        } // Encerro a conferência de resposta.

        // Confiro se falha é um erro ou objeto do tipo SyntaxError antes de executar o bloco abaixo.
        if (falha instanceof SyntaxError) {
            // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
            throw new Error('A API enviou uma resposta inválida. Confira o endereço configurado.');
        } // Encerro a conferência de falha.

        // Preservo as mensagens de validação devolvidas pelo backend.
        throw falha;
    // Executo esta limpeza tanto no sucesso quanto na falha para não deixar controles presos.
    } finally {
        // Cancelo o temporizador que já não preciso para ele não interromper uma operação concluída.
        clearTimeout(tempo);
    } // Concluo a etapa de limpeza do finally.
} // Termino solicitarApi e devolvo o controle a quem chamou.
