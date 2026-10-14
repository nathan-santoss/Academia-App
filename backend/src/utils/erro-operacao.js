// Preparo mensagens esperadas para as rotas sem criar uma classe própria de erros.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por autenticacao.js, operacao-online.js, acesso-servico.js e outros arquivos do mesmo fluxo.

// Monto um Error comum com mensagem e status HTTP; deixo quem chamou decidir quando interromper o pedido com throw.
export function erroOperacao(status, mensagem) {
    // Crio um Error comum com a mensagem que quero mostrar, sem precisar montar uma classe nova.
    const falha = new Error(mensagem);
    // Guardo o código HTTP junto do erro para o tratamento da API saber qual resposta enviar.
    falha.statusOperacao = status;
    // Devolvo o erro pronto; quem chamou esta função decide quando interromper o fluxo com throw.
    return falha;
} // Termino erroOperacao e devolvo o controle a quem chamou.
