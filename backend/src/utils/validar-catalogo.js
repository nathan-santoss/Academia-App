import { erroOperacao } from './erro-operacao.js';

export function prepararCatalogo(categoria, entrada) {

    if (categoria !== 'plano' && categoria !== 'modalidade') {

        throw erroOperacao(422, 'Escolha planos ou modalidades.');
    }

    if (!entrada || typeof entrada.nome !== 'string' || entrada.nome.trim().length < 2 || entrada.nome.trim().length > 100) {

        throw erroOperacao(422, 'Informe um nome entre 2 e 100 caracteres.');
    }

    if (!Number.isInteger(entrada.precoCentavos) || entrada.precoCentavos < 0 || entrada.precoCentavos > 2147483647) {

        throw erroOperacao(422, 'Informe um preço válido em centavos.');
    }

    if (typeof entrada.ativo !== 'boolean') {

        throw erroOperacao(422, 'Informe se o item está ativo.');
    }

    const dados = {

        nome: entrada.nome.trim(),

        precoCentavos: entrada.precoCentavos,

        ativo: entrada.ativo,
    };

    if (categoria === 'plano') {

        if (!['diario', 'quinzenal', 'mensal', 'trimestral', 'semestral', 'anual'].includes(entrada.periodo)) {

            throw erroOperacao(422, 'Escolha um dos períodos de plano disponíveis.');
        }

        dados.periodo = entrada.periodo;
    }

    return dados;
}
