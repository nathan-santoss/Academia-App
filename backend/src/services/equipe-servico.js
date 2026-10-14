import * as repositorio from '../repositories/equipe-repositorio.js';
import { erroOperacao } from '../utils/erro-operacao.js';
import { exigirTexto } from '../utils/validar-rotina.js';

export async function consultarPapeis(acesso) {
    const funcionario = await repositorio.buscarFuncionario(acesso.contaId);
    if (!funcionario || !funcionario.ativo || !Array.isArray(funcionario.papeis)) {
        return [];
    }
    return funcionario.papeis.filter(function permitido(papel) {
        return ['instrutor', 'recepcao', 'gestao', 'administrador'].includes(papel);
    });
}

export async function exigirPapel(acesso, papel) {
    const papeis = await consultarPapeis(acesso);
    if (!papeis.includes(papel)) {
        throw erroOperacao(403, 'Esta ação exige vínculo ativo de ' + papel + '.');
    }
}

export async function buscarAlunos(acesso, busca) {
    const papeis = await consultarPapeis(acesso);
    if (!papeis.some(function permitido(papel) {
        return ['instrutor', 'recepcao', 'gestao'].includes(papel);
    })) {
        throw erroOperacao(403, 'A busca de alunos é reservada à equipe autorizada.');
    }
    const termo = exigirTexto(busca, 'nome ou matrícula', 100);
    if (termo.length < 2) {
        throw erroOperacao(422, 'Digite pelo menos dois caracteres.');
    }
    return repositorio.buscarAlunos(termo);
}
