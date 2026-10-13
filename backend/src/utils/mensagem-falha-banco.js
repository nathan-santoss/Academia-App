// Traduzo causas conhecidas em orientações sem imprimir SQL, dados pessoais ou credenciais.
import { falhaDeConexao } from './falha-conexao.js';

export function mensagemFalhaBanco(falha) {
    let origem = falha;

    if (falha.original) {
        origem = falha.original;
    }

    if (origem.code === '28P01' || origem.code === '28000') {
        return 'O Neon recusou a autenticação. Confira o usuário e a senha em DATABASE_URL.';
    }

    if (origem.code === '3D000') {
        return 'O banco informado não existe. Confira o nome do banco em DATABASE_URL.';
    }

    if (origem.code === '42501') {
        return 'O usuário do Neon não tem permissão para acessar ou preparar as tabelas.';
    }

    if (origem.code === '42P01' || origem.code === '42703') {
        return 'A estrutura do Neon difere dos modelos. Confira as tabelas e colunas existentes.';
    }

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

    return 'Não foi possível concluir a operação no Neon. Confira a configuração e a estrutura do banco.';
}
