import { solicitarApi } from './api';

export function consultarExercicios(busca, grupo, pagina) {
    return solicitarApi('/exercicios?busca=' + encodeURIComponent(busca) + '&grupo=' + encodeURIComponent(grupo) + '&pagina=' + pagina + '&limite=20');
}
