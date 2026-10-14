// Valido e normalizo os dados recebidos para cadastrar uma pessoa e seu perfil de aluno.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por acesso-servico.js, aluno-servico.js.

import { cpfValido } from './validar-cpf.js';
import { validarDataNascimento } from './validar-data-nascimento.js';

// Confiro se recebi texto e se o tamanho, sem espaços nas pontas, cabe nos limites do campo.
function textoValido(valor, minimo, maximo) {
    // Recuso outros tipos antes de usar as operações próprias de texto.
    if (typeof valor !== 'string') {
        // Devolvo false como resultado desta conferência para quem chamou a função.
        return false;
    } // Encerro a conferência de esta condição.

    // Uso trim para tirar os espaços das pontas antes de contar quantas letras ficaram.
    const tamanho = valor.trim().length;
    // Entrego o resultado da comparação entre o resultado da comparação entre tamanho e minimo e o resultado da
    // comparação entre tamanho e maximo a quem chamou a função e termino este caminho.
    return tamanho >= minimo && tamanho <= maximo;
} // Termino textoValido e devolvo o controle a quem chamou.

// Retiro a pontuação e, quando presente no formato esperado, o código do Brasil para manter DDD e número.
function limparTelefone(valor) {
    // Uso replace com esta expressão para tirar tudo que não é algarismo, como parênteses e hífen.
    let telefone = valor.replace(/\D/g, '');

    // Retiro o código do Brasil quando ele acompanha o DDD e o telefone.
    if (telefone.startsWith('55') && telefone.length >= 12) {
        // Atualizo telefone com o resultado de telefone.slice. Copio só o trecho indicado sem alterar o valor
        // original.
        telefone = telefone.slice(2);
    } // Encerro a conferência de telefone.startsWith.

    // Entrego telefone a quem chamou a função e termino este caminho.
    return telefone;
} // Termino limparTelefone e devolvo o controle a quem chamou.

// Confiro a escrita e a quantidade de dígitos de um telefone brasileiro com DDD.
function telefoneValido(valor) {
    // Aceito os caracteres comuns de telefone e um sinal de mais apenas no início.
    if (typeof valor !== 'string' || !/^\+?[\d ()-]+$/.test(valor)) {
        // Devolvo false como resultado desta conferência para quem chamou a função.
        return false;
    } // Encerro a conferência de esta condição.

    // Confiro um DDD de dois dígitos seguido de oito ou nove dígitos do telefone.
    return /^[1-9]\d\d{8,9}$/.test(limparTelefone(valor));
} // Termino telefoneValido e devolvo o controle a quem chamou.

// Aceito ausência de foto e, quando há endereço, confiro HTTPS e formato sem baixar a imagem.
function validarFoto(foto) {
    // Permito omitir a foto porque ela é opcional no cadastro.
    if (foto === undefined || foto === null) {
        // Devolvo texto vazio para indicar que esta validação não encontrou problema.
        return '';
    } // Encerro a conferência de esta condição.

    // Verifico o tamanho antes de tentar interpretar o endereço.
    if (!textoValido(foto, 1, 2048)) {
        // Aviso quem chamou: "Informe uma URL de foto com até 2048 caracteres.". A função para aqui e não continua a
        // validação ou operação.
        return 'Informe uma URL de foto com até 2048 caracteres.';
    } // Encerro a conferência de textoValido.

    // Confiro o endereço sem baixar a imagem.
    try {
        // Crio endereco. Interpreto o endereço com URL para conferir suas partes sem depender apenas de buscas no
        // texto.
        const endereco = new URL(foto);

        // Aceito apenas HTTPS sem usuário ou senha embutidos no endereço da foto.
        if (endereco.protocol === 'https:' && !endereco.username && !endereco.password) {
            // Devolvo texto vazio para indicar que esta validação não encontrou problema.
            return '';
        } // Encerro a conferência de esta condição.
    // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
    } catch {
        // Converto a falha de leitura do endereço em uma mensagem de validação.
        return 'Informe uma URL HTTPS válida para a foto.';
    } // Termino o tratamento desta falha e sigo para a limpeza, quando houver.

    // Aviso quem chamou: "A foto deve usar HTTPS e não pode conter credenciais.". A função para aqui e não continua a
    // validação ou operação.
    return 'A foto deve usar HTTPS e não pode conter credenciais.';
} // Termino validarFoto e devolvo o controle a quem chamou.

// Aceito ausência do contato opcional; se ele foi preenchido, confiro nome e telefone juntos.
function validarContato(contato) {
    // Dispenso o contato de emergência quando nenhum valor foi enviado.
    if (contato === undefined || contato === null) {
        // Devolvo texto vazio para indicar que esta validação não encontrou problema.
        return '';
    } // Encerro a conferência de esta condição.

    // Espero um objeto com campos nomeados, em vez de uma lista ou um texto. Uso Array.isArray porque uma lista
    // também aparece como object no JavaScript, mas não é o contato que espero.
    if (typeof contato !== 'object' || Array.isArray(contato)) {
        // Aviso quem chamou: "O contato de emergência precisa conter nome e telefone.". A função para aqui e não
        // continua a validação ou operação.
        return 'O contato de emergência precisa conter nome e telefone.';
    } // Encerro a conferência de esta condição.

    // Exijo nome e telefone válidos quando o contato opcional é preenchido.
    if (!textoValido(contato.nome, 2, 150) || !telefoneValido(contato.telefone)) {
        // Aviso quem chamou: "Confira o nome e o telefone do contato de emergência.". A função para aqui e não
        // continua a validação ou operação.
        return 'Confira o nome e o telefone do contato de emergência.';
    } // Encerro a conferência de esta condição.

    // Devolvo texto vazio para indicar que esta validação não encontrou problema.
    return '';
} // Termino validarContato e devolvo o controle a quem chamou.

// Confiro os campos em ordem e devolvo a primeira mensagem de problema; texto vazio significa que posso continuar.
export function validarCadastroAluno(dados) {
    // Devolvo uma mensagem para o primeiro problema; uma string vazia indica dados válidos.
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        // Aviso quem chamou: "Envie os dados do aluno em um objeto JSON.". A função para aqui e não continua a
        // validação ou operação.
        return 'Envie os dados do aluno em um objeto JSON.';
    } // Encerro a conferência de esta condição.

    // Confiro se o nome respeita o tamanho aceito para o cadastro.
    if (!textoValido(dados.nome, 2, 150)) {
        // Aviso quem chamou: "O nome precisa ter entre 2 e 150 caracteres.". A função para aqui e não continua a
        // validação ou operação.
        return 'O nome precisa ter entre 2 e 150 caracteres.';
    } // Encerro a conferência de textoValido.

    // Delego a conferência dos dígitos do CPF à função específica desse documento.
    if (!cpfValido(dados.cpf)) {
        // Devolvo o texto "Informe um CPF válido." a quem chamou, encerrando este caminho da função.
        return 'Informe um CPF válido.';
    } // Encerro a conferência de cpfValido.

    // Verifico a data e a idade mínima antes de continuar com os contatos.
    const erroData = validarDataNascimento(dados.dataNascimento);

    // Paro na mensagem que veio da validação de nascimento, para não esconder esse problema com outro aviso.
    if (erroData) {
        // Entrego erroData a quem chamou a função e termino este caminho.
        return erroData;
    } // Encerro a conferência de erroData.

    // Procuro um e-mail sem espaços, com conteúdo antes e depois do arroba.
    if (!textoValido(dados.email, 3, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) {
        // Devolvo o texto "Informe um e-mail válido." a quem chamou, encerrando este caminho da função.
        return 'Informe um e-mail válido.';
    } // Encerro a conferência de esta condição.

    // Reaproveito a mesma conferência de telefone usada no contato de emergência.
    if (!telefoneValido(dados.telefone)) {
        // Aviso quem chamou: "Informe um telefone brasileiro com DDD.". A função para aqui e não continua a validação
        // ou operação.
        return 'Informe um telefone brasileiro com DDD.';
    } // Encerro a conferência de telefoneValido.

    // Analiso a foto somente pelas regras do campo opcional.
    const erroFoto = validarFoto(dados.fotoUrl);

    // Retorno o problema da foto antes de validar o restante do cadastro.
    if (erroFoto) {
        // Entrego erroFoto a quem chamou a função e termino este caminho.
        return erroFoto;
    } // Encerro a conferência de erroFoto.

    // Finalizo a validação com o contato de emergência, quando ele estiver presente.
    return validarContato(dados.contatoEmergencia);
} // Termino validarCadastroAluno e devolvo o controle a quem chamou.

// Organizo os campos que já foram validados e seleciono apenas os dados que devem chegar ao banco.
export function prepararCadastroAluno(dados) {
    // Represento os campos opcionais ausentes com null no banco.
    let foto = null;
    // Inicio contato com null, marcando a ausência de valor; vou ajustar esse valor conforme as condições abaixo.
    let contato = null;

    // Normalizo os campos opcionais somente depois que a validação foi concluída.
    if (dados.fotoUrl) {
        // Atualizo foto com o resultado de dados.fotoUrl.trim. Retiro os espaços das pontas, preservando os espaços
        // que fazem parte do conteúdo.
        foto = dados.fotoUrl.trim();
    } // Encerro a conferência de dados.fotoUrl.

    // Padronizo o nome e o telefone do contato que já passou pela validação.
    if (dados.contatoEmergencia) {
        // Atualizo contato com um objeto com os campos abaixo. Retiro os espaços das pontas, preservando os espaços
        // que fazem parte do conteúdo.
        contato = {
            // Preencho o nome usado para apresentar ou identificar este registro.
            nome: dados.contatoEmergencia.nome.trim(),
            // Uso o telefone preparado para manter a mesma escrita no cadastro.
            telefone: limparTelefone(dados.contatoEmergencia.telefone),
        }; // Concluo este objeto com os campos que a etapa atual precisa.
    } // Encerro a conferência de dados.contatoEmergencia.

    // Retiro espaços nas pontas, pontuação do CPF e diferenças de caixa do e-mail.
    return {
        // Preencho o nome usado para apresentar ou identificar este registro.
        nome: dados.nome.trim(),
        // Preencho o CPF com o valor preparado para o cadastro.
        cpf: dados.cpf.replace(/\D/g, ''),
        // Mantenho o nascimento em ano-mês-dia para a API e o banco interpretarem a mesma data.
        dataNascimento: dados.dataNascimento,
        // Tiro os espaços e deixo o e-mail em minúsculas para guardar a mesma escrita em todos os cadastros.
        email: dados.email.trim().toLowerCase(),
        // Uso o telefone preparado para manter a mesma escrita no cadastro.
        telefone: limparTelefone(dados.telefone),
        // Informo o endereço da foto; a imagem será carregada pelo aplicativo quando necessário.
        fotoUrl: foto,
        // Reúno o contato opcional de emergência separado dos dados do próprio aluno.
        contatoEmergencia: contato,
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino prepararCadastroAluno e devolvo o controle a quem chamou.
