// Valido e normalizo os dados recebidos para cadastrar uma pessoa e seu perfil de aluno.
import { cpfValido } from './validar-cpf.js';
import { validarDataNascimento } from './validar-data-nascimento.js';

function textoValido(valor, minimo, maximo) {
    // Recuso outros tipos antes de usar as operações próprias de texto.
    if (typeof valor !== 'string') {
        return false;
    }

    // Uso trim para tirar os espaços das pontas antes de contar quantas letras ficaram.
    const tamanho = valor.trim().length;
    return tamanho >= minimo && tamanho <= maximo;
}

function limparTelefone(valor) {
    // Uso replace com esta expressão para tirar tudo que não é algarismo, como parênteses e hífen.
    let telefone = valor.replace(/\D/g, '');

    // Retiro o código do Brasil quando ele acompanha o DDD e o telefone.
    if (telefone.startsWith('55') && telefone.length >= 12) {
        telefone = telefone.slice(2);
    }

    return telefone;
}

function telefoneValido(valor) {
    // Aceito os caracteres comuns de telefone e um sinal de mais apenas no início.
    if (typeof valor !== 'string' || !/^\+?[\d ()-]+$/.test(valor)) {
        return false;
    }

    // Confiro um DDD de dois dígitos seguido de oito ou nove dígitos do telefone.
    return /^[1-9]\d\d{8,9}$/.test(limparTelefone(valor));
}

function validarFoto(foto) {
    // Permito omitir a foto porque ela é opcional no cadastro.
    if (foto === undefined || foto === null) {
        return '';
    }

    // Verifico o tamanho antes de tentar interpretar o endereço.
    if (!textoValido(foto, 1, 2048)) {
        return 'Informe uma URL de foto com até 2048 caracteres.';
    }

    // Confiro o endereço sem baixar a imagem.
    try {
        const endereco = new URL(foto);

        // Aceito apenas HTTPS sem usuário ou senha embutidos no endereço da foto.
        if (endereco.protocol === 'https:' && !endereco.username && !endereco.password) {
            return '';
        }
    } catch {
        // Converto a falha de leitura do endereço em uma mensagem de validação.
        return 'Informe uma URL HTTPS válida para a foto.';
    }

    return 'A foto deve usar HTTPS e não pode conter credenciais.';
}

function validarContato(contato) {
    // Dispenso o contato de emergência quando nenhum valor foi enviado.
    if (contato === undefined || contato === null) {
        return '';
    }

    // Espero um objeto com campos nomeados, em vez de uma lista ou um texto.
    // Uso Array.isArray porque uma lista também aparece como object no JavaScript, mas não é o contato que espero.
    if (typeof contato !== 'object' || Array.isArray(contato)) {
        return 'O contato de emergência precisa conter nome e telefone.';
    }

    // Exijo nome e telefone válidos quando o contato opcional é preenchido.
    if (!textoValido(contato.nome, 2, 150) || !telefoneValido(contato.telefone)) {
        return 'Confira o nome e o telefone do contato de emergência.';
    }

    return '';
}

export function validarCadastroAluno(dados) {
    // Devolvo uma mensagem para o primeiro problema; uma string vazia indica dados válidos.
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        return 'Envie os dados do aluno em um objeto JSON.';
    }

    // Confiro se o nome respeita o tamanho aceito para o cadastro.
    if (!textoValido(dados.nome, 2, 150)) {
        return 'O nome precisa ter entre 2 e 150 caracteres.';
    }

    // Delego a conferência dos dígitos do CPF à função específica desse documento.
    if (!cpfValido(dados.cpf)) {
        return 'Informe um CPF válido.';
    }

    // Verifico a data e a idade mínima antes de continuar com os contatos.
    const erroData = validarDataNascimento(dados.dataNascimento);

    // Paro na mensagem que veio da validação de nascimento, para não esconder esse problema com outro aviso.
    if (erroData) {
        return erroData;
    }

    // Procuro um e-mail sem espaços, com conteúdo antes e depois do arroba.
    if (!textoValido(dados.email, 3, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) {
        return 'Informe um e-mail válido.';
    }

    // Reaproveito a mesma conferência de telefone usada no contato de emergência.
    if (!telefoneValido(dados.telefone)) {
        return 'Informe um telefone brasileiro com DDD.';
    }

    // Analiso a foto somente pelas regras do campo opcional.
    const erroFoto = validarFoto(dados.fotoUrl);

    if (erroFoto) {
        return erroFoto;
    }

    // Finalizo a validação com o contato de emergência, quando ele estiver presente.
    return validarContato(dados.contatoEmergencia);
}

export function prepararCadastroAluno(dados) {
    // Represento os campos opcionais ausentes com null no banco.
    let foto = null;
    let contato = null;

    // Normalizo os campos opcionais somente depois que a validação foi concluída.
    if (dados.fotoUrl) {
        foto = dados.fotoUrl.trim();
    }

    // Padronizo o nome e o telefone do contato que já passou pela validação.
    if (dados.contatoEmergencia) {
        contato = {
            nome: dados.contatoEmergencia.nome.trim(),
            telefone: limparTelefone(dados.contatoEmergencia.telefone),
        };
    }

    // Retiro espaços nas pontas, pontuação do CPF e diferenças de caixa do e-mail.
    return {
        nome: dados.nome.trim(),
        cpf: dados.cpf.replace(/\D/g, ''),
        dataNascimento: dados.dataNascimento,
        // Tiro os espaços e deixo o e-mail em minúsculas para guardar a mesma escrita em todos os cadastros.
        email: dados.email.trim().toLowerCase(),
        telefone: limparTelefone(dados.telefone),
        fotoUrl: foto,
        contatoEmergencia: contato,
    };
}
