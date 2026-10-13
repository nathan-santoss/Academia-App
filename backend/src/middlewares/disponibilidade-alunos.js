// Bloqueio as rotas de alunos em produção enquanto login e autorização ainda estão pendentes.
export function verificarDisponibilidadeAlunos(_requisicao, resposta, proximo) {
    // Paro o pedido aqui se a API estiver pública, porque ainda não tenho login e permissões para proteger os dados.
    if (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') {
        return resposta.status(503).json({
            mensagem: 'O login e as permissões ainda não foram implementados.',
        });
    }

    // Chamo proximo quando posso continuar; ele entrega o pedido à próxima etapa da rota.
    proximo();
}
