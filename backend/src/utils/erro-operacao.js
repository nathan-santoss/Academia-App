export function erroOperacao(status, mensagem) {

    const falha = new Error(mensagem);

    falha.statusOperacao = status;

    return falha;
}
