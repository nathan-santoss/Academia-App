// Preparo iniciais, datas e descrições de status para apresentar os cadastros.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por DetalhesAluno.jsx.

// Separo o nome e uso suas letras iniciais como alternativa visual à foto do cadastro.
export function obterIniciais(nome) {
    // Uso as primeiras letras do primeiro e do último nome como identificação visual.
    const partes = nome.trim().split(/\s+/);
    // Preparo iniciais com esta chamada. Leio o caractere da posição indicada; a posição zero representa a primeira
    // letra.
    let iniciais = partes[0].charAt(0);

    // Confiro se partes.length é maior que 1 antes de executar o bloco abaixo.
    if (partes.length > 1) {
        // Acrescento o resultado de partes[índice calculado].charAt em iniciais e guardo o novo resultado nessa mesma
        // variável.
        iniciais += partes[partes.length - 1].charAt(0);
    } // Encerro a conferência de partes.length.

    // Devolvo o resultado desta chamada a quem pediu esta etapa. Passo o texto para maiúsculas para padronizar sua
    // apresentação.
    return iniciais.toUpperCase();
} // Termino obterIniciais e devolvo o controle a quem chamou.

// Traduzo o estado do cadastro em texto sem afirmar que existe plano pago ou entrada liberada.
export function apresentarStatus(ativo) {
    // Descrevo apenas o cadastro, sem indicar plano pago ou entrada liberada.
    if (ativo) {
        // Devolvo o texto "Cadastro ativo" a quem chamou, encerrando este caminho da função.
        return 'Cadastro ativo';
    } // Encerro a conferência de ativo.

    // Devolvo o texto "Cadastro inativo" a quem chamou, encerrando este caminho da função.
    return 'Cadastro inativo';
} // Termino apresentarStatus e devolvo o controle a quem chamou.

// Reorganizo o texto de ano, mês e dia para mostrar a data sem deslocá-la por um fuso horário.
export function apresentarData(data) {
    // Reorganizo ano, mês e dia sem converter fuso horário.
    if (!data) {
        // Devolvo texto vazio para indicar que esta validação não encontrou problema.
        return '';
    } // Encerro a conferência de data.

    // Reorganizo os trechos de ano, mês e dia para mostrar a data como DD/MM/AAAA, sem converter seu fuso.
    return data.slice(8, 10) + '/' + data.slice(5, 7) + '/' + data.slice(0, 4);
} // Termino apresentarData e devolvo o controle a quem chamou.
