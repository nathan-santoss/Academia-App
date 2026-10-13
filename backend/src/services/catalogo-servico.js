// Valido planos e modalidades e aguardo a confirmação de suas mudanças no Neon.
import { consultarRegistros, registrarOperacao } from './persistencia-servico.js';
import { prepararCatalogo } from '../utils/validar-catalogo.js';
import { exigirId, obterIdOperacao } from '../utils/validar-id.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export function listarCatalogo(categoria) {
    // Limito a escolha aos dois catálogos disponíveis, para não aceitar qualquer nome vindo da URL.
    if (categoria !== 'plano' && categoria !== 'modalidade') {
        throw erroOperacao(422, 'Catálogo inválido.');
    }

    return consultarRegistros(categoria);
}

export async function salvarCatalogo(categoria, id, entrada, operacaoId) {
    // Separo o ID do item do ID do pedido: o mesmo item pode passar por várias edições.
    const registroId = exigirId(id);
    const pedidoId = obterIdOperacao(operacaoId);
    // Deixo a conferência de nome, preço e período na função de validação, para não repetir essas regras aqui.
    const dados = prepararCatalogo(categoria, entrada);
    // Começo sem versão anterior, porque um item novo ainda não tem uma data de atualização para comparar.
    let versao = null;

    if (entrada.versaoAnterior) {
        // Uso Date.parse para conferir se a versão recebida pode ser lida como data.
        if (typeof entrada.versaoAnterior !== 'string' || Number.isNaN(Date.parse(entrada.versaoAnterior))) {
            throw erroOperacao(422, 'A versão de origem é inválida.');
        }

        // Padronizo a data com toISOString para comparar o mesmo instante sem diferenças de escrita.
        versao = new Date(entrada.versaoAnterior).toISOString();
    }

    // Entrego a versão junto dos dados para o repositório perceber se alguém já editou esse item.
    return registrarOperacao(pedidoId, 'salvar', {
        categoria: categoria,
        id: registroId,
        dados: dados,
        versaoAnterior: versao,
    });
}
