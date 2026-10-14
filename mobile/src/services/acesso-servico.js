// Reúno os pedidos de login, cadastro, perfil e saída sem guardar a senha no celular.
// Sou chamado pelo contexto de acesso e pelo formulário de cadastro. Monto o endereço, o método HTTP e os dados de
// cada operação; deixo conexão, cabeçalhos da sessão e falhas comuns em api.js.

import { solicitarApi } from './api';

// Envio e-mail e senha ao login público; a resposta traz a credencial que o contexto vai guardar.
export function entrar(email, senha) {
    // Envio as credenciais apenas ao endpoint público de login usando HTTPS. Transformo os dados em texto JSON para
    // enviar, guardar ou comparar seu conteúdo.
    return solicitarApi('/acesso/entrar', {
        // Escolho o método HTTP que informa à API se quero consultar, criar ou excluir dados.
        method: 'POST',
        // Junto informações do pedido, como formato JSON, sessão e identificador de repetição.
        headers: {
            // Aviso que o corpo do pedido está em JSON para o Express conseguir interpretá-lo.
            'Content-Type': 'application/json',
        }, // Concluo os campos de headers e volto ao objeto que reúne essa configuração.
        // Coloco o conteúdo que seguirá no pedido; uso JSON.stringify quando a API espera JSON.
        body: JSON.stringify({
            // Preencho o e-mail com o valor preparado para este cadastro ou consulta.
            email: email,
            // Passo a senha somente para o fluxo de acesso; o backend calcula sua proteção antes de gravá-la.
            senha: senha,
        }), // Concluo este objeto com os campos que a etapa atual precisa.
    }, false); // Concluo a função passada acima e informo os valores que controlam esta chamada.
} // Termino entrar e devolvo o controle a quem chamou.

// Envio o formulário ao cadastro público e devolvo a confirmação da API à tela.
export function criarConta(dados) {
    // Peço a criação de uma conta pessoal; a API decide os campos e permissões aceitos. Transformo os dados em texto
    // JSON para enviar, guardar ou comparar seu conteúdo.
    return solicitarApi('/acesso/contas', {
        // Escolho o método HTTP que informa à API se quero consultar, criar ou excluir dados.
        method: 'POST',
        // Junto informações do pedido, como formato JSON, sessão e identificador de repetição.
        headers: {
            // Aviso que o corpo do pedido está em JSON para o Express conseguir interpretá-lo.
            'Content-Type': 'application/json',
        }, // Concluo os campos de headers e volto ao objeto que reúne essa configuração.
        // Coloco o conteúdo que seguirá no pedido; uso JSON.stringify quando a API espera JSON.
        body: JSON.stringify(dados),
    }, false); // Concluo a função passada acima e informo os valores que controlam esta chamada.
} // Termino criarConta e devolvo o controle a quem chamou.

// Peço o perfil com a sessão atual; a API descobre o aluno pelo token, sem receber um ID escolhido pela tela.
export function consultarPerfil() {
    // Devolvo o resultado desta chamada a quem pediu esta etapa. Chamo solicitarApi em api.js. Nesse passo,
    // centralizo o pedido HTTP, a sessão, a espera e a leitura da resposta para os outros serviços não repetirem esse
    // fluxo.
    return solicitarApi('/acesso/perfil');
} // Termino consultarPerfil e devolvo o controle a quem chamou.

// Peço à API que exclua a sessão atual antes de o contexto limpar o acesso no celular.
export function sair() {
    // Encerro a sessão no Neon antes de apagar a credencial deste aparelho.
    return solicitarApi('/acesso/sair', {
        // Escolho o método HTTP que informa à API se quero consultar, criar ou excluir dados.
        method: 'POST',
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino sair e devolvo o controle a quem chamou.
