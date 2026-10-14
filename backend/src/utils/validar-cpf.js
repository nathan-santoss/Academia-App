// Verifico o formato e os dígitos do CPF para recusar números inválidos no cadastro.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por validar-aluno.js.

// Faço a soma ponderada do CPF e uso o resto da divisão para calcular o próximo dígito de conferência.
function calcularDigito(parte) {
    // Começo a soma em zero e escolho o peso inicial pelo tamanho da parte recebida.
    let soma = 0;
    // Começo pelo primeiro algarismo; uso um índice para avançar no while sem precisar de um laço for.
    let indice = 0;
    // Escolho o primeiro peso pelo tamanho recebido: nove algarismos começam em dez e dez algarismos começam em onze.
    let peso = parte.length + 1;

    // Multiplico cada algarismo pelo peso, diminuindo o peso a cada posição.
    while (indice < parte.length) {
        // Converto o caractere com Number antes da multiplicação, porque eu recebi o CPF como texto.
        soma += Number(parte[indice]) * peso;
        // Diminuo o peso em um para o próximo algarismo participar da soma com o multiplicador seguinte.
        peso -= 1;
        // Avanço uma posição no CPF; esse passo também faz o while chegar ao fim do texto.
        indice += 1;
    } // Volto a conferir a condição da repetição antes de executar outra rodada.

    // Uso % para pegar o resto da divisão por onze, que é a parte da conta usada para conferir o CPF.
    const resto = soma % 11;

    // Uso zero quando o resto é zero ou um.
    if (resto < 2) {
        // Devolvo o dígito zero como texto, porque o CPF recebido também é texto.
        return '0';
    } // Encerro a conferência de resto.

    // Transformo o dígito calculado em texto para compará-lo com o CPF recebido.
    return String(11 - resto);
} // Termino calcularDigito e devolvo o controle a quem chamou.

// Confiro escrita e dígitos do CPF; essa conta valida o número, mas não prova quem é seu dono.
export function cpfValido(valor) {
    // Exijo texto para preservar os zeros que podem aparecer no início do CPF.
    if (typeof valor !== 'string') {
        // Devolvo false como resultado desta conferência para quem chamou a função.
        return false;
    } // Encerro a conferência de esta condição.

    // Admito o CPF com pontuação ou apenas com os onze dígitos.
    const formato = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;

    // Rejeito o valor quando a escrita não corresponde a um dos formatos aceitos.
    if (!formato.test(valor.trim())) {
        // Devolvo false como resultado desta conferência para quem chamou a função.
        return false;
    } // Encerro a conferência de formato.test.

    // Removo a pontuação para trabalhar apenas com os algarismos.
    const cpf = valor.replace(/\D/g, '');

    // Descarto sequências com onze dígitos iguais, que não representam CPFs válidos.
    if (/^(\d)\1{10}$/.test(cpf)) {
        // Devolvo false como resultado desta conferência para quem chamou a função.
        return false;
    } // Encerro a conferência de .test.

    // Pego os primeiros nove algarismos com slice e recalculo os dois últimos para conferir o número. Com essa conta
    // eu verifico o CPF, mas não provo a identidade de quem está usando o documento.
    const primeiro = calcularDigito(cpf.slice(0, 9));
    // Incluo o primeiro dígito que calculei, porque a conta do segundo depende dele.
    const segundo = calcularDigito(cpf.slice(0, 9) + primeiro);

    // Comparo os dois últimos algarismos com os dígitos que acabei de calcular.
    return cpf.slice(-2) === primeiro + segundo;
} // Termino cpfValido e devolvo o controle a quem chamou.
