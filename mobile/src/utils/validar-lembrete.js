// Confiro título, data e horário antes de preparar um lembrete para gravação.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por CadastroLembrete.jsx.

// Confiro título, data real e horário futuro antes de converter a escolha local em um instante ISO.
export function prepararLembrete(titulo, data, hora) {
    // Preparo nome com esta chamada. Retiro os espaços das pontas, preservando os espaços que fazem parte do
    // conteúdo.
    const nome = titulo.trim();

    // Confiro apenas o necessário para identificar e agendar este lembrete pessoal.
    if (!nome || nome.length > 100) {
        // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
        return {
            // Escolho a mensagem que será entregue a quem chamou este trecho.
            mensagem: 'Escreva um título com até 100 caracteres.',
        }; // Concluo este objeto com os campos que a etapa atual precisa.
    } // Encerro a conferência de esta condição.

    // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data) || !/^\d{2}:\d{2}$/.test(hora)) {
        // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
        return {
            // Escolho a mensagem que será entregue a quem chamou este trecho.
            mensagem: 'Use DD/MM/AAAA na data e HH:MM no horário.',
        }; // Concluo este objeto com os campos que a etapa atual precisa.
    } // Encerro a conferência de esta condição.

    // Separo DD/MM/AAAA pelas barras e uso map(Number) para converter cada parte em número; guardo os três resultados
    // na mesma ordem.
    const [dia, mes, ano] = data.split('/').map(Number);
    // Separo hora e minutos pelos dois-pontos e converto cada texto para número antes de montar a data.
    const [horas, minutos] = hora.split(':').map(Number);
    // Crio dataEscolhida. Trabalho com um objeto Date para comparar ou formatar o instante recebido.
    const dataEscolhida = new Date(ano, mes - 1, dia, horas, minutos);

    // Comparo os campos porque o JavaScript ajusta automaticamente datas inexistentes.
    if (dataEscolhida.getFullYear() !== ano || dataEscolhida.getMonth() !== mes - 1
        // Confiro também dia e hora para perceber se o Date corrigiu automaticamente algum valor inexistente.
        || dataEscolhida.getDate() !== dia || dataEscolhida.getHours() !== horas
        // Termino a conferência pelos minutos; entro no bloco se qualquer parte da data ficou diferente do que a
        // pessoa digitou.
        || dataEscolhida.getMinutes() !== minutos) {
        // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
        return {
            // Escolho a mensagem que será entregue a quem chamou este trecho.
            mensagem: 'Informe uma data e um horário válidos.',
        }; // Concluo este objeto com os campos que a etapa atual precisa.
    } // Encerro a conferência de esta condição.

    // Confiro se dataEscolhida.getTime é menor ou igual ao resultado de Date.now antes de executar o bloco abaixo.
    if (dataEscolhida.getTime() <= Date.now()) {
        // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
        return {
            // Escolho a mensagem que será entregue a quem chamou este trecho.
            mensagem: 'Escolha uma data e um horário futuros.',
        }; // Concluo este objeto com os campos que a etapa atual precisa.
    } // Encerro a conferência de dataEscolhida.getTime.

    // Interpreto o horário no fuso do aparelho e guardo um instante único no banco. Converto a data para o formato
    // ISO em UTC, que pode ser enviado e entendido pela API.
    return {
        // Defino o título que identifica este item para a pessoa.
        titulo: nome,
        // Guardo o instante do lembrete no formato preparado para salvar e agendar.
        dataHora: dataEscolhida.toISOString(),
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino prepararLembrete e devolvo o controle a quem chamou.
