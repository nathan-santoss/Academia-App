// Verifico o formato e os dígitos do CPF para recusar números inválidos no cadastro.
function calcularDigito(parte) {
    // Começo a soma em zero e escolho o peso inicial pelo tamanho da parte recebida.
    let soma = 0;
    let indice = 0;
    let peso = parte.length + 1;

    // Multiplico cada algarismo pelo peso, diminuindo o peso a cada posição.
    while (indice < parte.length) {
        soma += Number(parte[indice]) * peso;
        peso -= 1;
        indice += 1;
    }

    // Obtenho o resto da divisão por onze para aplicar a regra do dígito verificador.
    const resto = soma % 11;

    // Uso zero quando o resto é zero ou um.
    if (resto < 2) {
        return '0';
    }

    // Transformo o dígito calculado em texto para compará-lo com o CPF recebido.
    return String(11 - resto);
}

export function cpfValido(valor) {
    // Exijo texto para preservar os zeros que podem aparecer no início do CPF.
    if (typeof valor !== 'string') {
        return false;
    }

    // Admito o CPF com pontuação ou apenas com os onze dígitos.
    const formato = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;

    // Rejeito o valor quando a escrita não corresponde a um dos formatos aceitos.
    if (!formato.test(valor.trim())) {
        return false;
    }

    // Removo a pontuação para trabalhar apenas com os algarismos.
    const cpf = valor.replace(/\D/g, '');

    // Descarto sequências com onze dígitos iguais, que não representam CPFs válidos.
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    // Recalculo os dois dígitos finais para conferir o número recebido.
    const primeiro = calcularDigito(cpf.slice(0, 9));
    const segundo = calcularDigito(cpf.slice(0, 9) + primeiro);

    // Comparo os dois últimos algarismos com os dígitos que acabei de calcular.
    return cpf.slice(-2) === primeiro + segundo;
}
