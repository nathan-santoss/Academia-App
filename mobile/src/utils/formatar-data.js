// Reúno a escrita de datas e horários usada nos formulários e na apresentação de lembretes.
export function preencherData(valor) {
    // Acrescento as barras enquanto a pessoa digita apenas os números.
    let numeros = valor.replace(/\D/g, '').slice(0, 8);
    numeros = numeros.replace(/^(\d{2})(\d)/, '$1/$2');
    return numeros.replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2');
}

export function preencherHora(valor) {
    // Separo horas e minutos sem exigir a digitação dos dois-pontos.
    const numeros = valor.replace(/\D/g, '').slice(0, 4);
    return numeros.replace(/^(\d{2})(\d)/, '$1:$2');
}

export function apresentarHorario(dataHora) {
    // Apresento o instante salvo no fuso atual do aparelho.
    return new Date(dataHora).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
