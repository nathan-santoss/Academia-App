// Confiro os campos de planos e modalidades sem determinar preços ou regras ainda não aprovadas.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por catalogo-servico.js.

import { erroOperacao } from './erro-operacao.js';

// Confiro nome, preço, situação e período quando necessário; devolvo só os campos aceitos do catálogo.
export function prepararCatalogo(categoria, entrada) {
    // Confiro primeiro o tipo de catálogo, porque só o plano precisa ter um período.
    if (categoria !== 'plano' && categoria !== 'modalidade') {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, 'Escolha planos ou modalidades.');
    } // Encerro a conferência de esta condição.

    // Uso trim antes de contar as letras, para espaços nas pontas não fazerem um nome vazio passar.
    if (!entrada || typeof entrada.nome !== 'string' || entrada.nome.trim().length < 2 || entrada.nome.trim().length > 100) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, 'Informe um nome entre 2 e 100 caracteres.');
    } // Encerro a conferência de esta condição.

    // Aceito só centavos inteiros dentro do tamanho que a coluna INTEGER do PostgreSQL suporta.
    if (!Number.isInteger(entrada.precoCentavos) || entrada.precoCentavos < 0 || entrada.precoCentavos > 2147483647) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, 'Informe um preço válido em centavos.');
    } // Encerro a conferência de esta condição.

    // Exijo true ou false de verdade; eu não trato o texto 'false' como se fosse um booleano.
    if (typeof entrada.ativo !== 'boolean') {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, 'Informe se o item está ativo.');
    } // Encerro a conferência de esta condição.

    // Monto um objeto só com os campos permitidos, para não repassar qualquer propriedade que veio no pedido.
    const dados = {
        // Preencho o nome usado para apresentar ou identificar este registro.
        nome: entrada.nome.trim(),
        // Guardo o preço em centavos inteiros para não depender de arredondamentos com números fracionários.
        precoCentavos: entrada.precoCentavos,
        // Defino a situação inicial que o cadastro preparado deve levar para a próxima etapa.
        ativo: entrada.ativo,
    }; // Concluo este objeto com os campos que a etapa atual precisa.

    // Confiro se categoria é igual ao texto "plano" antes de executar o bloco abaixo.
    if (categoria === 'plano') {
        // Uso includes para conferir se o período está entre as opções aceitas antes de salvar.
        if (!['diario', 'quinzenal', 'mensal', 'trimestral', 'semestral', 'anual'].includes(entrada.periodo)) {
            // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
            throw erroOperacao(422, 'Escolha um dos períodos de plano disponíveis.');
        } // Encerro a conferência de .includes.

        // Atualizo dados.periodo com entrada.periodo.
        dados.periodo = entrada.periodo;
    } // Encerro a conferência de categoria.

    // Entrego dados a quem chamou a função e termino este caminho.
    return dados;
} // Termino prepararCatalogo e devolvo o controle a quem chamou.
