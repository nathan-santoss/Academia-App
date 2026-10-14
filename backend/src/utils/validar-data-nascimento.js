// Confiro a data de nascimento e a idade mínima usando o calendário de Brasília.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por validar-aluno.js.

// Confiro a data real e a idade pelo calendário de Brasília antes de permitir o cadastro.
export function validarDataNascimento(valor) {
    // Exijo ano, mês e dia em posições fixas para interpretar a data sem ambiguidade.
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        // Aviso quem chamou: "Informe a data de nascimento no formato AAAA-MM-DD.". A função para aqui e não continua
        // a validação ou operação.
        return 'Informe a data de nascimento no formato AAAA-MM-DD.';
    } // Encerro a conferência de esta condição.

    // Interpreto o nascimento em UTC para conferir a data sem deslocamento de fuso.
    const data = new Date(valor + 'T00:00:00.000Z');

    // Detecto datas inexistentes, como 30/02, antes de calcular a idade.
    if (Number.isNaN(data.getTime())) {
        // Devolvo a mensagem escrita nesta linha a quem chamou, encerrando este caminho da função.
        return 'Informe uma data de nascimento válida.';
    } // Encerro a conferência de Number.isNaN.

    // Comparo a data convertida com o texto original, porque o JavaScript pode ajustar 30/02 para março. Também
    // recuso o ano zero, que não faz sentido neste cadastro.
    if (data.toISOString().slice(0, 10) !== valor || valor.startsWith('0000')) {
        // Devolvo a mensagem escrita nesta linha a quem chamou, encerrando este caminho da função.
        return 'Informe uma data de nascimento válida.';
    } // Encerro a conferência de esta condição.

    // Considero o calendário de Brasília e mantenho a data no formato ano-mês-dia. Uso sv-SE porque esse formato
    // escreve a data como AAAA-MM-DD; o fuso continua sendo o de Brasília.
    const hoje = new Intl.DateTimeFormat('sv-SE', {
        // Escolho explicitamente o fuso para esta conta não depender do lugar onde o servidor está rodando.
        timeZone: 'America/Sao_Paulo',
    }).format(new Date()); // Formato a data de agora com o calendário de Brasília escolhido acima; recebo um texto em AAAA-MM-DD para comparar mês e dia.

    // Comparo os textos no formato ano-mês-dia para impedir nascimento no futuro.
    if (valor > hoje) {
        // Aviso quem chamou: "A data de nascimento não pode estar no futuro.". A função para aqui e não continua a
        // validação ou operação.
        return 'A data de nascimento não pode estar no futuro.';
    } // Encerro a conferência de valor.

    // Calculo primeiro a diferença entre os anos antes de conferir o aniversário.
    let idade = Number(hoje.slice(0, 4)) - Number(valor.slice(0, 4));

    // Desconto um ano se o aniversário ainda não aconteceu. Comparo só mês e dia com slice(5); assim eu sei se o
    // aniversário deste ano já passou.
    if (hoje.slice(5) < valor.slice(5)) {
        // Desconto um ano porque a diferença entre os anos ainda inclui um aniversário que não chegou.
        idade -= 1;
    } // Encerro a conferência de hoje.slice.

    // Aplico a idade mínima prevista para o cadastro de alunos.
    if (idade < 18) {
        // Devolvo a mensagem escrita nesta linha a quem chamou, encerrando este caminho da função.
        return 'O aluno precisa ter 18 anos completos.';
    } // Encerro a conferência de idade.

    // Retorno texto vazio para indicar que não encontrei problemas com a data.
    return '';
} // Termino validarDataNascimento e devolvo o controle a quem chamou.
