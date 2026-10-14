function calcularDigito(parte) {

    let soma = 0;

    let indice = 0;

    let peso = parte.length + 1;

    while (indice < parte.length) {

        soma += Number(parte[indice]) * peso;

        peso -= 1;

        indice += 1;
    }

    const resto = soma % 11;

    if (resto < 2) {

        return '0';
    }

    return String(11 - resto);
}

export function cpfValido(valor) {

    if (typeof valor !== 'string') {

        return false;
    }

    const formato = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;

    if (!formato.test(valor.trim())) {

        return false;
    }

    const cpf = valor.replace(/\D/g, '');

    if (/^(\d)\1{10}$/.test(cpf)) {

        return false;
    }

    const primeiro = calcularDigito(cpf.slice(0, 9));

    const segundo = calcularDigito(cpf.slice(0, 9) + primeiro);

    return cpf.slice(-2) === primeiro + segundo;
}
