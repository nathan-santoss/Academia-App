import { createHash } from 'node:crypto';

function ordenar(valor) {
    if (Array.isArray(valor)) {
        return valor.map(ordenar);
    }
    if (valor && typeof valor === 'object') {
        return Object.keys(valor).sort().reduce(function copiar(resultado, chave) {
            resultado[chave] = ordenar(valor[chave]);
            return resultado;
        }, {});
    }
    return valor;
}

export function resumirOperacao(valor) {
    return createHash('sha256').update(JSON.stringify(ordenar(valor))).digest('hex');
}
