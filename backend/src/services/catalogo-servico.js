// Organizo o catálogo de planos e modalidades, mantendo mudanças locais pendentes até o Neon confirmar.
import { consultarRegistros, registrarOperacao } from './persistencia-servico.js';
import { prepararCatalogo } from '../utils/validar-catalogo.js';
import { exigirId } from '../utils/validar-id.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export function listarCatalogo(categoria) {
    if (categoria !== 'plano' && categoria !== 'modalidade') {
        throw erroOperacao(422, 'Catálogo inválido.');
    }

    return consultarRegistros(categoria);
}

export async function salvarCatalogo(categoria, id, entrada, operacaoId) {
    exigirId(id);
    exigirId(operacaoId);
    const dados = prepararCatalogo(categoria, entrada);
    let versao = null;

    if (entrada.versaoAnterior) {
        if (typeof entrada.versaoAnterior !== 'string' || Number.isNaN(Date.parse(entrada.versaoAnterior))) {
            throw erroOperacao(422, 'A versão de origem é inválida.');
        }

        versao = entrada.versaoAnterior;
    }

    return registrarOperacao(operacaoId, 'salvar', {
        categoria: categoria,
        id: id,
        dados: dados,
        versaoAnterior: versao,
    }, Object.assign({}, dados, {
        id: id,
        atualizadoEm: versao,
    }));
}
