// Traduzo causas conhecidas em orientações sem imprimir SQL, dados pessoais ou credenciais.
import { falhaDeConexao } from './falha-conexao.js';

export function mensagemFalhaBanco(falha) {
    let origem = falha;

    // Vou até o erro original para ler o código que o PostgreSQL ou a rede realmente devolveu.
    if (falha.original) {
        origem = falha.original;
    }

    // Separo a recusa de usuário ou senha de uma queda de conexão, porque a solução é diferente.
    if (origem.code === '28P01' || origem.code === '28000') {
        return 'O Neon recusou a autenticação. Confira o usuário e a senha em DATABASE_URL.';
    }

    if (origem.code === '3D000') {
        return 'O banco informado não existe. Confira o nome do banco em DATABASE_URL.';
    }

    // Aponto falta de permissão quando a conexão existe, mas o usuário não pode fazer aquela operação.
    if (origem.code === '42501') {
        return 'O usuário do Neon não tem permissão para acessar ou preparar as tabelas.';
    }

    // Aviso sobre tabela ou coluna ausente para não confundir uma estrutura antiga com problema de internet.
    if (origem.code === '42P01' || origem.code === '42703') {
        return 'A estrutura do Neon difere dos modelos. Confira as tabelas e colunas existentes.';
    }

    // Reúno os erros de certificado que eu reconheço, mantendo a validação SSL ativa.
    if ([
        'DEPTH_ZERO_SELF_SIGNED_CERT', 'SELF_SIGNED_CERT_IN_CHAIN',
        'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
        'CERT_HAS_EXPIRED', 'ERR_TLS_CERT_ALTNAME_INVALID',
    ].includes(origem.code)) {
        return 'Não foi possível validar o certificado SSL do Neon. Confira o ambiente e o endereço da conexão.';
    }

    if (falhaDeConexao(falha)) {
        return 'Não foi possível comunicar com o Neon no tempo esperado. Confira a rede e a disponibilidade do banco.';
    }

    // Uso uma orientação mais geral quando não reconheço a causa, sem copiar o erro inteiro para o log.
    return 'Não foi possível concluir a operação no Neon. Confira a configuração e a estrutura do banco.';
}
