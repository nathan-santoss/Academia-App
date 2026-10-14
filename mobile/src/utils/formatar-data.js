// Reúno a escrita de datas e horários usada nos formulários e na apresentação de lembretes.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por CadastroAluno.jsx, CadastroLembrete.jsx, ListaLembretes.jsx.

// Retiro caracteres extras e acrescento as barras enquanto a pessoa digita os números da data.
export function preencherData(valor) {
    // Acrescento as barras enquanto a pessoa digita apenas os números.
    let numeros = valor.replace(/\D/g, '').slice(0, 8);
    // Reconheço os dois primeiros dígitos e o próximo; $1 e $2 reaproveitam esses grupos para inserir a primeira
    // barra.
    numeros = numeros.replace(/^(\d{2})(\d)/, '$1/$2');
    // Preservo dia e mês no primeiro grupo e insiro outra barra antes do ano, aproveitando os grupos $1 e $2.
    return numeros.replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2');
} // Termino preencherData e devolvo o controle a quem chamou.

// Limito os números a horas e minutos e acrescento os dois-pontos sem exigir esse toque no teclado.
export function preencherHora(valor) {
    // Separo horas e minutos sem exigir a digitação dos dois-pontos.
    const numeros = valor.replace(/\D/g, '').slice(0, 4);
    // Uso os grupos da expressão para colocar dois-pontos após os dois primeiros dígitos, formando HH:MM.
    return numeros.replace(/^(\d{2})(\d)/, '$1:$2');
} // Termino preencherHora e devolvo o controle a quem chamou.

// Mostro o instante salvo no formato brasileiro e no fuso atual do aparelho.
export function apresentarHorario(dataHora) {
    // Apresento o instante salvo no fuso atual do aparelho.
    return new Date(dataHora).toLocaleString('pt-BR', {
        // Peço o dia com dois algarismos para manter a apresentação da data consistente.
        day: '2-digit',
        // Peço o mês com dois algarismos para manter a apresentação da data consistente.
        month: '2-digit',
        // Incluo o ano completo para não confundir datas de anos diferentes.
        year: 'numeric',
        // Apresento a hora com dois algarismos no formato escolhido.
        hour: '2-digit',
        // Incluo os minutos com dois algarismos para completar o horário.
        minute: '2-digit',
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino apresentarHorario e devolvo o controle a quem chamou.
