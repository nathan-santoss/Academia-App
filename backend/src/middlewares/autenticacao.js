// Exijo uma sessão válida e limito a consulta de aluno ao dono do cadastro.
// Fico entre a rota e o controlador. Coloco a identidade conferida em requisicao.acesso para as próximas funções
// saberem quem fez o pedido; nunca aceito essa identidade só porque o celular enviou um ID.

import { conferirSessao } from '../services/acesso-servico.js';
import { erroOperacao } from '../utils/erro-operacao.js';

// Confiro o cabeçalho de acesso antes de liberar o próximo passo da rota.
export async function exigirSessao(requisicao, _resposta, proximo) {
    // Guardo a identidade conferida no pedido; não aproveito permissões enviadas pelo celular.
    requisicao.acesso = await conferirSessao(requisicao.get('Authorization'));
    // Libero a próxima função da rota depois de terminar esta conferência.
    proximo();
} // Termino exigirSessao e devolvo o controle a quem chamou.

// Comparo o aluno da URL com o aluno da sessão para bloquear a consulta de outra pessoa.
export function exigirProprioAluno(requisicao, _resposta, proximo) {
    // Impedo a troca do ID na URL para consultar o cadastro de outra pessoa.
    if (requisicao.params.id !== requisicao.acesso.alunoId) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(403, 'Você só pode consultar seu próprio cadastro.');
    } // Encerro a conferência de requisicao.params.id.
    // Libero a próxima função da rota depois de terminar esta conferência.
    proximo();
} // Termino exigirProprioAluno e devolvo o controle a quem chamou.

// Interrompo ações reservadas à equipe, pois os papéis de funcionário ainda não são liberados neste fluxo.
export function exigirEquipe(_requisicao, _resposta, _proximo) {
    // Mantenho as ações de equipe fechadas até existir o vínculo funcional e suas permissões.
    throw erroOperacao(403, 'Esta ação é reservada à equipe da academia.');
} // Termino exigirEquipe e devolvo o controle a quem chamou.
