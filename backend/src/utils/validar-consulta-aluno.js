// Confiro busca e paginação antes de consultar os alunos no banco.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por aluno-servico.js.

// Valido os filtros vindos da URL e transformo página e limite em números antes da consulta.
export function prepararConsultaAlunos(consulta) {
    // Começo pela primeira página, com vinte alunos e nenhuma busca textual.
    let pagina = 1;
    // Inicio limite com 20; vou ajustar esse valor conforme as condições abaixo.
    let limite = 20;
    // Inicio busca com texto vazio; vou ajustar esse valor conforme as condições abaixo.
    let busca = '';

    // Leio os filtros opcionais e mantenho os padrões quando eles estão ausentes.
    if (consulta.pagina !== undefined) {
        // Aceito somente algarismos que representem uma página maior que zero.
        if (typeof consulta.pagina !== 'string' || !/^[1-9]\d*$/.test(consulta.pagina)) {
            // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
            return {
                // Escolho a mensagem que será entregue a quem chamou este trecho.
                mensagem: 'Informe uma página inteira e positiva.',
            }; // Concluo este objeto com os campos que a etapa atual precisa.
        } // Encerro a conferência de esta condição.

        // Converto o texto da URL para o número usado na paginação.
        pagina = Number(consulta.pagina);
    } // Encerro a conferência de consulta.pagina.

    // Valido a quantidade de alunos por página quando ela foi informada.
    if (consulta.limite !== undefined) {
        // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
        if (typeof consulta.limite !== 'string' || !/^[1-9]\d*$/.test(consulta.limite)) {
            // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
            return {
                // Escolho a mensagem que será entregue a quem chamou este trecho.
                mensagem: 'Informe um limite inteiro e positivo.',
            }; // Concluo este objeto com os campos que a etapa atual precisa.
        } // Encerro a conferência de esta condição.

        // Converto o limite depois de conferir o texto, porque eu vou usar esse valor como número na consulta.
        limite = Number(consulta.limite);
    } // Encerro a conferência de consulta.limite.

    // Limito o tamanho da resposta e o alcance da paginação.
    if (pagina > 1000000 || limite > 100) {
        // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
        return {
            // Escolho a mensagem que será entregue a quem chamou este trecho.
            mensagem: 'Use uma página até 1000000 e um limite até 100.',
        }; // Concluo este objeto com os campos que a etapa atual precisa.
    } // Encerro a conferência de esta condição.

    // Recebo uma busca curta em texto e retiro os espaços das pontas.
    if (consulta.busca !== undefined) {
        // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
        if (typeof consulta.busca !== 'string' || consulta.busca.length > 100) {
            // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
            return {
                // Escolho a mensagem que será entregue a quem chamou este trecho.
                mensagem: 'A busca deve ser um texto com até 100 caracteres.',
            }; // Concluo este objeto com os campos que a etapa atual precisa.
        } // Encerro a conferência de esta condição.

        // Retiro os espaços das pontas para uma busca como ' Ana ' funcionar como 'Ana'.
        busca = consulta.busca.trim();
    } // Encerro a conferência de consulta.busca.

    // Respeito o intervalo de números que a matrícula pode assumir no PostgreSQL.
    if (/^A\d{1,19}$/i.test(busca)) {
        // Uso BigInt para conferir matrículas grandes sem arredondamento.
        const numero = BigInt(busca.slice(1));

        // Recuso zero e valores acima do maior inteiro BIGINT do PostgreSQL. Uso o n no fim dos números para comparar
        // BigInt com BigInt, sem misturar os tipos.
        if (numero < 1n || numero > 9223372036854775807n) {
            // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
            return {
                // Escolho a mensagem que será entregue a quem chamou este trecho.
                mensagem: 'Informe uma matrícula válida.',
            }; // Concluo este objeto com os campos que a etapa atual precisa.
        } // Encerro a conferência de esta condição.
    } // Encerro a conferência de .test.

    // Entrego os filtros padronizados para o serviço consultar os alunos.
    return {
        // Informo a página usada para calcular de onde a consulta deve começar.
        pagina: pagina,
        // Informo quantos itens podem ser retornados de uma vez nesta consulta.
        limite: limite,
        // Levo o texto de busca já preparado para montar o filtro da consulta.
        busca: busca,
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino prepararConsultaAlunos e devolvo o controle a quem chamou.
