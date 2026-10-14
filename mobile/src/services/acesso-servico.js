// Reúno os pedidos de login, cadastro, perfil e saída sem guardar a senha no celular.
import { solicitarApi } from './api';

export function entrar(email, senha) {
    // Envio as credenciais apenas ao endpoint público de login usando HTTPS.
    return solicitarApi('/acesso/entrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            senha: senha,
        }),
    }, false);
}

export function criarConta(dados) {
    // Peço a criação de uma conta pessoal; a API decide os campos e permissões aceitos.
    return solicitarApi('/acesso/contas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    }, false);
}

export function consultarPerfil() {
    return solicitarApi('/acesso/perfil');
}

export function sair() {
    // Encerro a sessão no Neon antes de apagar a credencial deste aparelho.
    return solicitarApi('/acesso/sair', {
        method: 'POST',
    });
}
