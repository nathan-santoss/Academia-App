// Seleciono os campos do cadastro e formato a matrícula antes de responder ao mobile.
export function apresentarResumoAluno(aluno) {
    // Seleciono apenas os campos necessários à listagem.
    return {
        id: aluno.id,
        // Transformo o número em texto e uso padStart para completar com zeros; por exemplo, 1 vira A000001.
        matricula: 'A' + String(aluno.numeroMatricula).padStart(6, '0'),
        nome: aluno.pessoa.nome,
        ativo: aluno.ativo,
        criadoEm: aluno.criadoEm,
    };
}

export function apresentarAluno(aluno) {
    // Completo o resumo com os dados usados na consulta individual.
    const dados = apresentarResumoAluno(aluno);

    // Reúno os dados da identidade central na resposta do aluno.
    dados.pessoaId = aluno.pessoaId;
    dados.cpf = aluno.pessoa.cpf;
    dados.dataNascimento = aluno.pessoa.dataNascimento;
    dados.email = aluno.pessoa.email;
    dados.telefone = aluno.pessoa.telefone;
    // Adiciono as informações opcionais e a data de atualização do perfil.
    dados.fotoUrl = aluno.fotoUrl;
    dados.contatoEmergencia = aluno.contatoEmergencia;
    dados.atualizadoEm = aluno.atualizadoEm;

    // Devolvo o objeto completo só na consulta individual, porque a listagem usa uma versão menor.
    return dados;
}
