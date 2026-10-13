// Confiro a data de nascimento e a idade mínima usando o calendário de Brasília.
export function validarDataNascimento(valor) {
    // Exijo ano, mês e dia em posições fixas para interpretar a data sem ambiguidade.
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return 'Informe a data de nascimento no formato AAAA-MM-DD.';
    }

    // Interpreto o nascimento em UTC para conferir a data sem deslocamento de fuso.
    const data = new Date(valor + 'T00:00:00.000Z');

    // Detecto datas inexistentes, como 30/02, antes de calcular a idade.
    if (Number.isNaN(data.getTime())) {
        return 'Informe uma data de nascimento válida.';
    }

    // Recuso datas que o JavaScript ajustou para outro dia e descarto o ano zero.
    if (data.toISOString().slice(0, 10) !== valor || valor.startsWith('0000')) {
        return 'Informe uma data de nascimento válida.';
    }

    // Considero o calendário de Brasília e mantenho a data no formato ano-mês-dia.
    const hoje = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'America/Sao_Paulo',
    }).format(new Date());

    // Comparo os textos no formato ano-mês-dia para impedir nascimento no futuro.
    if (valor > hoje) {
        return 'A data de nascimento não pode estar no futuro.';
    }

    // Calculo primeiro a diferença entre os anos antes de conferir o aniversário.
    let idade = Number(hoje.slice(0, 4)) - Number(valor.slice(0, 4));

    // Desconto um ano se o aniversário ainda não aconteceu.
    if (hoje.slice(5) < valor.slice(5)) {
        idade -= 1;
    }

    // Aplico a idade mínima prevista para o cadastro de alunos.
    if (idade < 18) {
        return 'O aluno precisa ter 18 anos completos.';
    }

    // Retorno texto vazio para indicar que não encontrei problemas com a data.
    return '';
}
