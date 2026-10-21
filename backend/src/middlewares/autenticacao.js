import { conferirSessao } from '../services/acesso-servico.js';
import { exigirAlgumPapel } from '../services/equipe-servico.js';
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

export async function exigirEquipe(requisicao, _resposta, proximo) {
    await exigirAlgumPapel(requisicao.acesso, ['recepcao', 'gestao']);
    proximo();
}

export async function exigirGestao(requisicao, _resposta, proximo) {
    await exigirAlgumPapel(requisicao.acesso, ['gestao']);
    proximo();
}
