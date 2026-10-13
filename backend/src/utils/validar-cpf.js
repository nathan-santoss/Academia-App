// Verifico o formato e os dígitos do CPF para recusar números inválidos no cadastro.
function calcularDigito(parte) {
    // Começo a soma em zero e escolho o peso inicial pelo tamanho da parte recebida.
    let soma = 0;
    let indice = 0;
    let peso = parte.length + 1;

    // Multiplico cada algarismo pelo peso, diminuindo o peso a cada posição.
    while (indice < parte.length) {
        // Converto o caractere com Number antes da multiplicação, porque eu recebi o CPF como texto.
        soma += Number(parte[indice]) * peso;
        peso -= 1;
        indice += 1;
    }

    // Uso % para pegar o resto da divisão por onze, que é a parte da conta usada para conferir o CPF.
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

    // Pego os primeiros nove algarismos com slice e recalculo os dois últimos para conferir o número.
    // Com essa conta eu verifico o CPF, mas não provo a identidade de quem está usando o documento.
    const primeiro = calcularDigito(cpf.slice(0, 9));
    // Incluo o primeiro dígito que calculei, porque a conta do segundo depende dele.
    const segundo = calcularDigito(cpf.slice(0, 9) + primeiro);

    // Comparo os dois últimos algarismos com os dígitos que acabei de calcular.
    return cpf.slice(-2) === primeiro + segundo;
}
