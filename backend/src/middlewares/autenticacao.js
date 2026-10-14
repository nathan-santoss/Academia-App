import { conferirSessao } from '../services/acesso-servico.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function exigirSessao(requisicao, _resposta, proximo) {

    requisicao.acesso = await conferirSessao(requisicao.get('Authorization'));

    proximo();
}

export function exigirProprioAluno(requisicao, _resposta, proximo) {

    if (requisicao.params.id !== requisicao.acesso.alunoId) {

        throw erroOperacao(403, 'Você só pode consultar seu próprio cadastro.');
    }

    proximo();
}

export function exigirEquipe(_requisicao, _resposta, _proximo) {

    throw erroOperacao(403, 'Esta ação é reservada à equipe da academia.');
}
