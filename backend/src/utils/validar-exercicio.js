import { erroOperacao } from './erro-operacao.js';

function texto(valor, limite) {
    if (valor === undefined) {
        return '';
    }
    if (typeof valor !== 'string' || valor.length > limite) {
        throw erroOperacao(422, 'Confira os filtros do catálogo.');
    }
    return valor.trim();
}

function numero(valor, padrao, minimo, maximo) {
    if (valor === undefined) {
        return padrao;
    }
    if (typeof valor !== 'string' || !/^\d+$/.test(valor) || Number(valor) < minimo || Number(valor) > maximo) {
        throw erroOperacao(422, 'Confira a página e o limite do catálogo.');
    }
    return Number(valor);
}

export function validarConsultaExercicios(consulta) {
    return {
        busca: texto(consulta.busca, 100),
        grupo: texto(consulta.grupo, 60),
        pagina: numero(consulta.pagina, 0, 0, 100000),
        limite: numero(consulta.limite, 20, 1, 50),
    };
}
