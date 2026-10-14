import { validarAcesso } from './validar-acesso.js';
import { validarCadastroAluno, prepararCadastroAluno } from './validar-aluno.js';
import { validarSenhaNova } from './senha.js';
import { erroOperacao } from './erro-operacao.js';

export function prepararContaDemonstrativa(prefixo, papel) {
    const campos = ['EMAIL', 'SENHA', 'NOME', 'CPF', 'NASCIMENTO', 'TELEFONE'];
    if (campos.some(function ausente(campo) {
        return !process.env[prefixo + campo];
    })) {
        return null;
    }
    const entrada = {
        email: process.env[prefixo + 'EMAIL'],
        senha: process.env[prefixo + 'SENHA'],
        nome: process.env[prefixo + 'NOME'],
        cpf: process.env[prefixo + 'CPF'],
        dataNascimento: process.env[prefixo + 'NASCIMENTO'],
        telefone: process.env[prefixo + 'TELEFONE'],
    };
    validarAcesso(entrada);
    validarSenhaNova(entrada.senha);
    const mensagem = validarCadastroAluno(entrada);
    if (mensagem) {
        throw erroOperacao(422, 'Confira a identidade demonstrativa em ' + prefixo + ': ' + mensagem);
    }
    return {
        dados: prepararCadastroAluno(entrada),
        senha: entrada.senha,
        papel: papel,
    };
}
