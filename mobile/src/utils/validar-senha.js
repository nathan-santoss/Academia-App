export function senhaNovaValida(senha) {
    return senha.length >= 8 && new TextEncoder().encode(senha).length <= 72;
}
