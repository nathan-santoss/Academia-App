// Confiro o preenchimento do formulário e adapto seus campos ao contrato da API.
export function criarFormularioVazio() {
    // Inicio um cadastro sem preencher dados pessoais fictícios automaticamente.
    return {
        nome: '',
        cpf: '',
        nascimento: '',
        email: '',
        telefone: '',
        fotoUrl: '',
        contatoNome: '',
        contatoTelefone: '',
    };
}

export function validarFormulario(dados) {
    // Confiro o preenchimento na tela; CPF, idade e demais regras continuam na API.
    if (!dados.nome.trim() || !dados.cpf.trim() || !dados.email.trim() || !dados.telefone.trim()) {
        return 'Preencha nome, CPF, data de nascimento, e-mail e telefone.';
    }

    // Peço a data no formato familiar ao usuário antes de convertê-la para a API.
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dados.nascimento.trim())) {
        return 'Informe a data de nascimento no formato DD/MM/AAAA.';
    }

    // Evito enviar metade do contato opcional de emergência.
    if (dados.contatoNome.trim() || dados.contatoTelefone.trim()) {
        if (!dados.contatoNome.trim() || !dados.contatoTelefone.trim()) {
            return 'Preencha nome e telefone do contato de emergência ou deixe ambos vazios.';
        }
    }

    return '';
}

export function prepararCadastro(dados) {
    // Converto a data sem usar fuso horário e mantenho campos opcionais ausentes como null.
    const partesData = dados.nascimento.trim().split('/');
    const cadastro = {
        nome: dados.nome.trim(),
        cpf: dados.cpf.trim(),
        dataNascimento: partesData[2] + '-' + partesData[1] + '-' + partesData[0],
        email: dados.email.trim(),
        telefone: dados.telefone.trim(),
        fotoUrl: null,
        contatoEmergencia: null,
    };

    if (dados.fotoUrl.trim()) {
        cadastro.fotoUrl = dados.fotoUrl.trim();
    }

    if (dados.contatoNome.trim()) {
        cadastro.contatoEmergencia = {
            nome: dados.contatoNome.trim(),
            telefone: dados.contatoTelefone.trim(),
        };
    }

    return cadastro;
}
