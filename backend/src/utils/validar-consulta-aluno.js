// Confiro busca e paginação antes de consultar os alunos no banco.
export function prepararConsultaAlunos(consulta) {
    // Começo pela primeira página, com vinte alunos e nenhuma busca textual.
    let pagina = 1;
    let limite = 20;
    let busca = '';

    // Leio os filtros opcionais e mantenho os padrões quando eles estão ausentes.
    if (consulta.pagina !== undefined) {
        // Aceito somente algarismos que representem uma página maior que zero.
        if (typeof consulta.pagina !== 'string' || !/^[1-9]\d*$/.test(consulta.pagina)) {
            return {
                mensagem: 'Informe uma página inteira e positiva.',
            };
        }

        // Converto o texto da URL para o número usado na paginação.
        pagina = Number(consulta.pagina);
    }

    // Valido a quantidade de alunos por página quando ela foi informada.
    if (consulta.limite !== undefined) {
        if (typeof consulta.limite !== 'string' || !/^[1-9]\d*$/.test(consulta.limite)) {
            return {
                mensagem: 'Informe um limite inteiro e positivo.',
            };
        }

        // Converto o limite depois de conferir o texto, porque eu vou usar esse valor como número na consulta.
        limite = Number(consulta.limite);
    }

    // Limito o tamanho da resposta e o alcance da paginação.
    if (pagina > 1000000 || limite > 100) {
        return {
            mensagem: 'Use uma página até 1000000 e um limite até 100.',
        };
    }

    // Recebo uma busca curta em texto e retiro os espaços das pontas.
    if (consulta.busca !== undefined) {
        if (typeof consulta.busca !== 'string' || consulta.busca.length > 100) {
            return {
                mensagem: 'A busca deve ser um texto com até 100 caracteres.',
            };
        }

        // Retiro os espaços das pontas para uma busca como ' Ana ' funcionar como 'Ana'.
        busca = consulta.busca.trim();
    }

    // Respeito o intervalo de números que a matrícula pode assumir no PostgreSQL.
    if (/^A\d{1,19}$/i.test(busca)) {
        // Uso BigInt para conferir matrículas grandes sem arredondamento.
        const numero = BigInt(busca.slice(1));

        // Recuso zero e valores acima do maior inteiro BIGINT do PostgreSQL.
        // Uso o n no fim dos números para comparar BigInt com BigInt, sem misturar os tipos.
        if (numero < 1n || numero > 9223372036854775807n) {
            return {
                mensagem: 'Informe uma matrícula válida.',
            };
        }
    }

    // Entrego os filtros padronizados para o serviço consultar os alunos.
    return {
        pagina: pagina,
        limite: limite,
        busca: busca,
    };
}
