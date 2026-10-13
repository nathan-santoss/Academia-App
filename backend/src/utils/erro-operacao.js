// Preparo mensagens esperadas para as rotas sem criar uma classe própria de erros.
export function erroOperacao(status, mensagem) {
    // Crio um Error comum com a mensagem que quero mostrar, sem precisar montar uma classe nova.
    const falha = new Error(mensagem);
    // Guardo o código HTTP junto do erro para o tratamento da API saber qual resposta enviar.
    falha.statusOperacao = status;
    // Devolvo o erro pronto; quem chamou esta função decide quando interromper o fluxo com throw.
    return falha;
}
