import { cpfValido } from './validar-cpf.js';
import { validarDataNascimento } from './validar-data-nascimento.js';

function textoValido(valor, minimo, maximo) {

    if (typeof valor !== 'string') {

        return false;
    }

    const tamanho = valor.trim().length;

    return tamanho >= minimo && tamanho <= maximo;
}

function limparTelefone(valor) {

    let telefone = valor.replace(/\D/g, '');

    if (telefone.startsWith('55') && telefone.length >= 12) {

        telefone = telefone.slice(2);
    }

    return telefone;
}

function telefoneValido(valor) {

    if (typeof valor !== 'string' || !/^\+?[\d ()-]+$/.test(valor)) {

        return false;
    }

    return /^[1-9]\d\d{8,9}$/.test(limparTelefone(valor));
}

function validarFoto(foto) {

    if (foto === undefined || foto === null) {

        return '';
    }

    if (!textoValido(foto, 1, 2048)) {

        return 'Informe uma URL de foto com até 2048 caracteres.';
    }

    try {

        const endereco = new URL(foto);

        if (endereco.protocol === 'https:' && !endereco.username && !endereco.password) {

            return '';
        }

    } catch {

        return 'Informe uma URL HTTPS válida para a foto.';
    }

    return 'A foto deve usar HTTPS e não pode conter credenciais.';
}

function validarContato(contato) {

    if (contato === undefined || contato === null) {

        return '';
    }

    if (typeof contato !== 'object' || Array.isArray(contato)) {

        return 'O contato de emergência precisa conter nome e telefone.';
    }

    if (!textoValido(contato.nome, 2, 150) || !telefoneValido(contato.telefone)) {

        return 'Confira o nome e o telefone do contato de emergência.';
    }

    return '';
}

export function validarCadastroAluno(dados) {

    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {

        return 'Envie os dados do aluno em um objeto JSON.';
    }

    if (!textoValido(dados.nome, 2, 150)) {

        return 'O nome precisa ter entre 2 e 150 caracteres.';
    }

    if (!cpfValido(dados.cpf)) {

        return 'Informe um CPF válido.';
    }

    const erroData = validarDataNascimento(dados.dataNascimento);

    if (erroData) {

        return erroData;
    }

    if (!textoValido(dados.email, 3, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) {

        return 'Informe um e-mail válido.';
    }

    if (!telefoneValido(dados.telefone)) {

        return 'Informe um telefone brasileiro com DDD.';
    }

    const erroFoto = validarFoto(dados.fotoUrl);

    if (erroFoto) {

        return erroFoto;
    }

    return validarContato(dados.contatoEmergencia);
}

export function prepararCadastroAluno(dados) {

    let foto = null;

    let contato = null;

    if (dados.fotoUrl) {

        foto = dados.fotoUrl.trim();
    }

    if (dados.contatoEmergencia) {

        contato = {

            nome: dados.contatoEmergencia.nome.trim(),

            telefone: limparTelefone(dados.contatoEmergencia.telefone),
        };
    }

    return {

        nome: dados.nome.trim(),

        cpf: dados.cpf.replace(/\D/g, ''),

        dataNascimento: dados.dataNascimento,

        email: dados.email.trim().toLowerCase(),

        telefone: limparTelefone(dados.telefone),

        fotoUrl: foto,

        contatoEmergencia: contato,
    };
}
