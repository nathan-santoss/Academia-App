// Reposiciono o item sem recriar identidades nem modificar a lista original.
export function posicionarItem(lista, indice, destino) {
    if (!Number.isInteger(indice) || !Number.isInteger(destino) || indice < 0 || indice >= lista.length || destino < 0 || destino >= lista.length) {
        return lista;
    }
    const copia = lista.slice();
    const removidos = copia.splice(indice, 1);
    copia.splice(destino, 0, removidos[0]);
    return copia;
}
