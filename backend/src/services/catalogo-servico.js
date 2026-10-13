// Valido planos e modalidades e aguardo a confirmação de suas mudanças no Neon.
import { consultarRegistros, registrarOperacao } from './persistencia-servico.js';
import { prepararCatalogo } from '../utils/validar-catalogo.js';
import { exigirId, obterIdOperacao } from '../utils/validar-id.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export function listarCatalogo(categoria) {
    if (categoria !== 'plano' && categoria !== 'modalidade') {
        throw erroOperacao(422, 'Catálogo inválido.');
    }

    return consultarRegistros(categoria);
}

export async function salvarCatalogo(categoria, id, entrada, operacaoId) {
    const registroId = exigirId(id);
    const pedidoId = obterIdOperacao(operacaoId);
    const dados = prepararCatalogo(categoria, entrada);
    let versao = null;

    if (entrada.versaoAnterior) {
        if (typeof entrada.versaoAnterior !== 'string' || Number.isNaN(Date.parse(entrada.versaoAnterior))) {
            throw erroOperacao(422, 'A versão de origem é inválida.');
        }

        versao = new Date(entrada.versaoAnterior).toISOString();
    }

    return registrarOperacao(pedidoId, 'salvar', {
        categoria: categoria,
        id: registroId,
        dados: dados,
        versaoAnterior: versao,
    });
}
