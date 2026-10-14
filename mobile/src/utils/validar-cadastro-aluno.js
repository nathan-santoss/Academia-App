// Confiro o preenchimento do formulário e adapto seus campos ao contrato da API.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por CadastroAluno.jsx.

// Preparo os campos vazios para começar o formulário sem inventar dados de uma pessoa.
export function criarFormularioVazio() {
    // Inicio um cadastro sem preencher dados pessoais fictícios automaticamente.
    return {
        // Preencho o nome usado para apresentar ou identificar este registro.
        nome: '',
        // Preencho o CPF com o valor preparado para o cadastro.
        cpf: '',
        // Informo a data de nascimento que já passou pela preparação do formulário.
        nascimento: '',
        // Preencho o e-mail com o valor preparado para este cadastro ou consulta.
        email: '',
        // Uso o telefone preparado para manter a mesma escrita no cadastro.
        telefone: '',
        // Informo o endereço da foto; a imagem será carregada pelo aplicativo quando necessário.
        fotoUrl: '',
        // Preencho contatoNome com texto vazio no objeto que estou preparando.
        contatoNome: '',
        // Preencho contatoTelefone com texto vazio no objeto que estou preparando.
        contatoTelefone: '',
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino criarFormularioVazio e devolvo o controle a quem chamou.

// Confiro o preenchimento básico no celular; deixo a API conferir novamente CPF, idade e demais regras.
export function validarFormulario(dados) {
    // Confiro o preenchimento na tela; CPF, idade e demais regras continuam na API.
    if (!dados.nome.trim() || !dados.cpf.trim() || !dados.email.trim() || !dados.telefone.trim()) {
        // Aviso quem chamou: "Preencha nome, CPF, data de nascimento, e-mail e telefone.". A função para aqui e não
        // continua a validação ou operação.
        return 'Preencha nome, CPF, data de nascimento, e-mail e telefone.';
    } // Encerro a conferência de esta condição.

    // Peço a data no formato familiar ao usuário antes de convertê-la para a API.
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dados.nascimento.trim())) {
        // Aviso quem chamou: "Informe a data de nascimento no formato DD/MM/AAAA.". A função para aqui e não continua
        // a validação ou operação.
        return 'Informe a data de nascimento no formato DD/MM/AAAA.';
    } // Encerro a conferência de .test.

    // Evito enviar metade do contato opcional de emergência.
    if (dados.contatoNome.trim() || dados.contatoTelefone.trim()) {
        // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
        if (!dados.contatoNome.trim() || !dados.contatoTelefone.trim()) {
            // Aviso quem chamou: "Preencha nome e telefone do contato de emergência ou deixe ambos vazios.". A função
            // para aqui e não continua a validação ou operação.
            return 'Preencha nome e telefone do contato de emergência ou deixe ambos vazios.';
        } // Encerro a conferência de esta condição.
    } // Encerro a conferência de dados.contatoNome.trim.

    // Devolvo texto vazio para indicar que esta validação não encontrou problema.
    return '';
} // Termino validarFormulario e devolvo o controle a quem chamou.

// Converto a data para o formato da API e junto somente os campos esperados no pedido de cadastro.
export function prepararCadastro(dados) {
    // Converto a data sem usar fuso horário e mantenho campos opcionais ausentes como null.
    const partesData = dados.nascimento.trim().split('/');
    // Monto cadastro como um objeto para agrupar os campos desta etapa.
    const cadastro = {
        // Preencho o nome usado para apresentar ou identificar este registro.
        nome: dados.nome.trim(),
        // Preencho o CPF com o valor preparado para o cadastro.
        cpf: dados.cpf.trim(),
        // Reorganizo dia, mês e ano digitados para AAAA-MM-DD, que é o formato esperado pelo backend.
        dataNascimento: partesData[2] + '-' + partesData[1] + '-' + partesData[0],
        // Preencho o e-mail com o valor preparado para este cadastro ou consulta.
        email: dados.email.trim(),
        // Uso o telefone preparado para manter a mesma escrita no cadastro.
        telefone: dados.telefone.trim(),
        // Informo o endereço da foto; a imagem será carregada pelo aplicativo quando necessário.
        fotoUrl: null,
        // Reúno o contato opcional de emergência separado dos dados do próprio aluno.
        contatoEmergencia: null,
    }; // Concluo este objeto com os campos que a etapa atual precisa.

    // Confiro se dados.fotoUrl.trim confirma a condição antes de executar o bloco abaixo.
    if (dados.fotoUrl.trim()) {
        // Atualizo cadastro.fotoUrl com o resultado de dados.fotoUrl.trim. Retiro os espaços das pontas, preservando
        // os espaços que fazem parte do conteúdo.
        cadastro.fotoUrl = dados.fotoUrl.trim();
    } // Encerro a conferência de dados.fotoUrl.trim.

    // Confiro se dados.contatoNome.trim confirma a condição antes de executar o bloco abaixo.
    if (dados.contatoNome.trim()) {
        // Atualizo cadastro.contatoEmergencia com um objeto com os campos abaixo. Retiro os espaços das pontas,
        // preservando os espaços que fazem parte do conteúdo.
        cadastro.contatoEmergencia = {
            // Preencho o nome usado para apresentar ou identificar este registro.
            nome: dados.contatoNome.trim(),
            // Uso o telefone preparado para manter a mesma escrita no cadastro.
            telefone: dados.contatoTelefone.trim(),
        }; // Concluo este objeto com os campos que a etapa atual precisa.
    } // Encerro a conferência de dados.contatoNome.trim.

    // Entrego cadastro a quem chamou a função e termino este caminho.
    return cadastro;
} // Termino prepararCadastro e devolvo o controle a quem chamou.
