// Bloqueio as rotas de alunos em produção enquanto login e autorização ainda estão pendentes.
export function verificarDisponibilidadeAlunos(_requisicao, resposta, proximo) {
    // Bloqueio a área de alunos em produção até implementarmos login e permissões.
    if (process.env.NODE_ENV === 'production') {
        return resposta.status(503).json({
            mensagem: 'O login e as permissões ainda não foram implementados.',
        });
    }

    // Libero o atendimento local sem exigir senha ou chave nos cabeçalhos.
    proximo();
}
