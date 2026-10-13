// Confiro título, data e horário antes de preparar um lembrete para gravação.
export function prepararLembrete(titulo, data, hora) {
    const nome = titulo.trim();

    // Confiro apenas o necessário para identificar e agendar este lembrete pessoal.
    if (!nome || nome.length > 100) {
        return {
            mensagem: 'Escreva um título com até 100 caracteres.',
        };
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data) || !/^\d{2}:\d{2}$/.test(hora)) {
        return {
            mensagem: 'Use DD/MM/AAAA na data e HH:MM no horário.',
        };
    }

    const [dia, mes, ano] = data.split('/').map(Number);
    const [horas, minutos] = hora.split(':').map(Number);
    const dataEscolhida = new Date(ano, mes - 1, dia, horas, minutos);

    // Comparo os campos porque o JavaScript ajusta automaticamente datas inexistentes.
    if (dataEscolhida.getFullYear() !== ano || dataEscolhida.getMonth() !== mes - 1
        || dataEscolhida.getDate() !== dia || dataEscolhida.getHours() !== horas
        || dataEscolhida.getMinutes() !== minutos) {
        return {
            mensagem: 'Informe uma data e um horário válidos.',
        };
    }

    if (dataEscolhida.getTime() <= Date.now()) {
        return {
            mensagem: 'Escolha uma data e um horário futuros.',
        };
    }

    // Interpreto o horário no fuso do aparelho e guardo um instante único no banco.
    return {
        titulo: nome,
        dataHora: dataEscolhida.toISOString(),
    };
}

