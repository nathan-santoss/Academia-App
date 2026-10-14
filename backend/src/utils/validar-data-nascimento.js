export function validarDataNascimento(valor) {

    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {

        return 'Informe a data de nascimento no formato AAAA-MM-DD.';
    }

    const data = new Date(valor + 'T00:00:00.000Z');

    if (Number.isNaN(data.getTime())) {

        return 'Informe uma data de nascimento válida.';
    }

    if (data.toISOString().slice(0, 10) !== valor || valor.startsWith('0000')) {

        return 'Informe uma data de nascimento válida.';
    }

    const hoje = new Intl.DateTimeFormat('sv-SE', {

        timeZone: 'America/Sao_Paulo',
    }).format(new Date());

    if (valor > hoje) {

        return 'A data de nascimento não pode estar no futuro.';
    }

    let idade = Number(hoje.slice(0, 4)) - Number(valor.slice(0, 4));

    if (hoje.slice(5) < valor.slice(5)) {

        idade -= 1;
    }

    if (idade < 18) {

        return 'O aluno precisa ter 18 anos completos.';
    }

    return '';
}
