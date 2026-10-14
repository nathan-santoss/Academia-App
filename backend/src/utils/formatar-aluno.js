export function apresentarResumoAluno(aluno) {

    return {

        id: aluno.id,

        matricula: 'A' + String(aluno.numeroMatricula).padStart(6, '0'),

        nome: aluno.pessoa.nome,

        ativo: aluno.ativo,

        criadoEm: aluno.criadoEm,
    };
}

export function apresentarAluno(aluno) {

    const dados = apresentarResumoAluno(aluno);

    dados.pessoaId = aluno.pessoaId;

    dados.cpf = aluno.pessoa.cpf;

    dados.dataNascimento = aluno.pessoa.dataNascimento;

    dados.email = aluno.pessoa.email;

    dados.telefone = aluno.pessoa.telefone;

    dados.fotoUrl = aluno.fotoUrl;

    dados.contatoEmergencia = aluno.contatoEmergencia;

    dados.atualizadoEm = aluno.atualizadoEm;

    return dados;
}
