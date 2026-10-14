// Exijo uma sessão válida e limito a consulta de aluno ao dono do cadastro.
import { conferirSessao } from '../services/acesso-servico.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function exigirSessao(requisicao, _resposta, proximo) {
    // Guardo a identidade conferida no pedido; não aproveito permissões enviadas pelo celular.
    requisicao.acesso = await conferirSessao(requisicao.get('Authorization'));
    proximo();
}

export function exigirProprioAluno(requisicao, _resposta, proximo) {
    // Impedo a troca do ID na URL para consultar o cadastro de outra pessoa.
    if (requisicao.params.id !== requisicao.acesso.alunoId) {
        throw erroOperacao(403, 'Você só pode consultar seu próprio cadastro.');
    }
    proximo();
}

export function exigirEquipe(_requisicao, _resposta, _proximo) {
    // Mantenho as ações de equipe fechadas até existir o vínculo funcional e suas permissões.
    throw erroOperacao(403, 'Esta ação é reservada à equipe da academia.');
}
