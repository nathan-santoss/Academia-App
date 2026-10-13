// Confiro os campos de planos e modalidades sem determinar preços ou regras ainda não aprovadas.
import { erroOperacao } from './erro-operacao.js';

export function prepararCatalogo(categoria, entrada) {
    // Confiro primeiro o tipo de catálogo, porque só o plano precisa ter um período.
    if (categoria !== 'plano' && categoria !== 'modalidade') {
        throw erroOperacao(422, 'Escolha planos ou modalidades.');
    }

    // Uso trim antes de contar as letras, para espaços nas pontas não fazerem um nome vazio passar.
    if (!entrada || typeof entrada.nome !== 'string' || entrada.nome.trim().length < 2 || entrada.nome.trim().length > 100) {
        throw erroOperacao(422, 'Informe um nome entre 2 e 100 caracteres.');
    }

    // Aceito só centavos inteiros dentro do tamanho que a coluna INTEGER do PostgreSQL suporta.
    if (!Number.isInteger(entrada.precoCentavos) || entrada.precoCentavos < 0 || entrada.precoCentavos > 2147483647) {
        throw erroOperacao(422, 'Informe um preço válido em centavos.');
    }

    // Exijo true ou false de verdade; eu não trato o texto 'false' como se fosse um booleano.
    if (typeof entrada.ativo !== 'boolean') {
        throw erroOperacao(422, 'Informe se o item está ativo.');
    }

    // Monto um objeto só com os campos permitidos, para não repassar qualquer propriedade que veio no pedido.
    const dados = {
        nome: entrada.nome.trim(),
        precoCentavos: entrada.precoCentavos,
        ativo: entrada.ativo,
    };

    if (categoria === 'plano') {
        // Uso includes para conferir se o período está entre as opções aceitas antes de salvar.
        if (!['diario', 'quinzenal', 'mensal', 'trimestral', 'semestral', 'anual'].includes(entrada.periodo)) {
            throw erroOperacao(422, 'Escolha um dos períodos de plano disponíveis.');
        }

        dados.periodo = entrada.periodo;
    }

    return dados;
}
