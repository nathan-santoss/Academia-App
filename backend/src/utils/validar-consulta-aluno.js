export function prepararConsultaAlunos(consulta) {

    let pagina = 1;

    let limite = 20;

    let busca = '';

    if (consulta.pagina !== undefined) {

        if (typeof consulta.pagina !== 'string' || !/^[1-9]\d*$/.test(consulta.pagina)) {

            return {

                mensagem: 'Informe uma página inteira e positiva.',
            };
        }

        pagina = Number(consulta.pagina);
    }

    if (consulta.limite !== undefined) {

        if (typeof consulta.limite !== 'string' || !/^[1-9]\d*$/.test(consulta.limite)) {

            return {

                mensagem: 'Informe um limite inteiro e positivo.',
            };
        }

        limite = Number(consulta.limite);
    }

    if (pagina > 1000000 || limite > 100) {

        return {

            mensagem: 'Use uma página até 1000000 e um limite até 100.',
        };
    }

    if (consulta.busca !== undefined) {

        if (typeof consulta.busca !== 'string' || consulta.busca.length > 100) {

            return {

                mensagem: 'A busca deve ser um texto com até 100 caracteres.',
            };
        }

        busca = consulta.busca.trim();
    }

    if (/^A\d{1,19}$/i.test(busca)) {

        const numero = BigInt(busca.slice(1));

        if (numero < 1n || numero > 9223372036854775807n) {

            return {

                mensagem: 'Informe uma matrícula válida.',
            };
        }
    }

    return {

        pagina: pagina,

        limite: limite,

        busca: busca,
    };
}
