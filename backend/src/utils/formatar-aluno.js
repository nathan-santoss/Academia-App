// Seleciono os campos do cadastro e formato a matrícula antes de responder ao mobile.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por operacao-online.js, aluno-servico.js.

// Escolho os campos curtos da lista e formato a matrícula para não expor o cadastro completo ali.
export function apresentarResumoAluno(aluno) {
    // Seleciono apenas os campos necessários à listagem.
    return {
        // Informo o identificador deste registro para conseguir encontrá-lo depois.
        id: aluno.id,
        // Transformo o número em texto e uso padStart para completar com zeros; por exemplo, 1 vira A000001.
        matricula: 'A' + String(aluno.numeroMatricula).padStart(6, '0'),
        // Preencho o nome usado para apresentar ou identificar este registro.
        nome: aluno.pessoa.nome,
        // Indico se este registro está ativo no fluxo que está sendo montado.
        ativo: aluno.ativo,
        // Entrego a data em que o registro foi criado, preenchida pelo Sequelize.
        criadoEm: aluno.criadoEm,
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino apresentarResumoAluno e devolvo o controle a quem chamou.

// Completo o resumo com os dados pessoais usados na consulta individual do cadastro.
export function apresentarAluno(aluno) {
    // Completo o resumo com os dados usados na consulta individual.
    const dados = apresentarResumoAluno(aluno);

    // Reúno os dados da identidade central na resposta do aluno.
    dados.pessoaId = aluno.pessoaId;
    // Atualizo dados.cpf com aluno.pessoa.cpf.
    dados.cpf = aluno.pessoa.cpf;
    // Atualizo dados.dataNascimento com aluno.pessoa.dataNascimento.
    dados.dataNascimento = aluno.pessoa.dataNascimento;
    // Atualizo dados.email com aluno.pessoa.email.
    dados.email = aluno.pessoa.email;
    // Atualizo dados.telefone com aluno.pessoa.telefone.
    dados.telefone = aluno.pessoa.telefone;
    // Adiciono as informações opcionais e a data de atualização do perfil.
    dados.fotoUrl = aluno.fotoUrl;
    // Atualizo dados.contatoEmergencia com aluno.contatoEmergencia.
    dados.contatoEmergencia = aluno.contatoEmergencia;
    // Atualizo dados.atualizadoEm com aluno.atualizadoEm.
    dados.atualizadoEm = aluno.atualizadoEm;

    // Devolvo o objeto completo só na consulta individual, porque a listagem usa uma versão menor.
    return dados;
} // Termino apresentarAluno e devolvo o controle a quem chamou.
