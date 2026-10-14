// Traduzo causas conhecidas em orientações sem imprimir SQL, dados pessoais ou credenciais.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por aplicacao.js, servidor.js.

import { falhaDeConexao } from './falha-conexao.js';

// Escolho uma orientação pelo tipo de falha sem copiar SQL, credenciais ou dados pessoais para o log.
export function mensagemFalhaBanco(falha) {
    // Inicio origem com falha; vou ajustar esse valor conforme as condições abaixo.
    let origem = falha;

    // Vou até o erro original para ler o código que o PostgreSQL ou a rede realmente devolveu.
    if (falha.original) {
        // Atualizo origem com falha.original.
        origem = falha.original;
    } // Encerro a conferência de falha.original.

    // Separo a recusa de usuário ou senha de uma queda de conexão, porque a solução é diferente.
    if (origem.code === '28P01' || origem.code === '28000') {
        // Aviso quem chamou: "O Neon recusou a autenticação. Confira o usuário e a senha em DATABASE_URL.". A função
        // para aqui e não continua a validação ou operação.
        return 'O Neon recusou a autenticação. Confira o usuário e a senha em DATABASE_URL.';
    } // Encerro a conferência de esta condição.

    // Confiro se origem.code é igual ao texto "3D000" antes de executar o bloco abaixo.
    if (origem.code === '3D000') {
        // Aviso quem chamou: "O banco informado não existe. Confira o nome do banco em DATABASE_URL.". A função para
        // aqui e não continua a validação ou operação.
        return 'O banco informado não existe. Confira o nome do banco em DATABASE_URL.';
    } // Encerro a conferência de origem.code.

    // Aponto falta de permissão quando a conexão existe, mas o usuário não pode fazer aquela operação.
    if (origem.code === '42501') {
        // Aviso quem chamou: "O usuário do Neon não tem permissão para acessar ou preparar as tabelas.". A função
        // para aqui e não continua a validação ou operação.
        return 'O usuário do Neon não tem permissão para acessar ou preparar as tabelas.';
    } // Encerro a conferência de origem.code.

    // Aviso sobre tabela ou coluna ausente para não confundir uma estrutura antiga com problema de internet.
    if (origem.code === '42P01' || origem.code === '42703') {
        // Aviso quem chamou: "A estrutura do Neon difere dos modelos. Confira as tabelas e colunas existentes.". A
        // função para aqui e não continua a validação ou operação.
        return 'A estrutura do Neon difere dos modelos. Confira as tabelas e colunas existentes.';
    } // Encerro a conferência de esta condição.

    // Reúno os erros de certificado que eu reconheço, mantendo a validação SSL ativa.
    if ([
        // Reconheço certificados assinados por eles mesmos, que não passaram pela confiança esperada.
        'DEPTH_ZERO_SELF_SIGNED_CERT', 'SELF_SIGNED_CERT_IN_CHAIN',
        // Incluo falhas em que o ambiente não conseguiu confirmar quem emitiu o certificado.
        'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
        // Separo também certificado vencido ou emitido para um endereço diferente.
        'CERT_HAS_EXPIRED', 'ERR_TLS_CERT_ALTNAME_INVALID',
    ].includes(origem.code)) { // Entro neste bloco se o código estiver entre as falhas de certificado listadas acima.
        // Aviso quem chamou: "Não foi possível validar o certificado SSL do Neon. Confira o ambiente e o endereço da
        // conexão.". A função para aqui e não continua a validação ou operação.
        return 'Não foi possível validar o certificado SSL do Neon. Confira o ambiente e o endereço da conexão.';
    } // Encerro a conferência de .includes.

    // Confiro se falhaDeConexao confirma a condição antes de executar o bloco abaixo.
    if (falhaDeConexao(falha)) {
        // Aviso quem chamou: "Não foi possível comunicar com o Neon no tempo esperado. Confira a rede e a
        // disponibilidade do banco.". A função para aqui e não continua a validação ou operação.
        return 'Não foi possível comunicar com o Neon no tempo esperado. Confira a rede e a disponibilidade do banco.';
    } // Encerro a conferência de falhaDeConexao.

    // Uso uma orientação mais geral quando não reconheço a causa, sem copiar o erro inteiro para o log.
    return 'Não foi possível concluir a operação no Neon. Confira a configuração e a estrutura do banco.';
} // Termino mensagemFalhaBanco e devolvo o controle a quem chamou.
