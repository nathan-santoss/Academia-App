import { erroOperacao } from './erro-operacao.js';

export function obterPagina(valor) {
    if (valor === undefined) {
        return 0;
    }
    if (typeof valor !== 'string' || !/^\d+$/.test(valor) || Number(valor) > 100000) {
        throw erroOperacao(422, 'Informe uma página inteira entre 0 e 100000.');
    }
    return Number(valor);
}
