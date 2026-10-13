// Preparo mensagens esperadas para as rotas sem criar uma classe própria de erros.
export function erroOperacao(status, mensagem) {
    const falha = new Error(mensagem);
    falha.statusOperacao = status;
    return falha;
}
