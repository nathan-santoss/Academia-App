// Valido planos e modalidades e aguardo a confirmação de suas mudanças no Neon.
// Recebo o pedido do controlador, aplico as regras e chamo os repositórios para acessar o Neon. Devolvo o resultado
// ao controlador para ele responder à tela. Sou usado por academia-controlador.js.

import { consultarRegistros, registrarOperacao } from './persistencia-servico.js';
import { prepararCatalogo } from '../utils/validar-catalogo.js';
import { exigirId, obterIdOperacao } from '../utils/validar-id.js';
import { erroOperacao } from '../utils/erro-operacao.js';

// Preparo a consulta do catálogo com as conferências necessárias e peço à persistência que fale com o repositório.
export function listarCatalogo(categoria) {
    // Limito a escolha aos dois catálogos disponíveis, para não aceitar qualquer nome vindo da URL.
    if (categoria !== 'plano' && categoria !== 'modalidade') {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, 'Catálogo inválido.');
    } // Encerro a conferência de esta condição.

    // Devolvo o resultado desta chamada a quem pediu esta etapa. Chamo consultarRegistros em persistencia-servico.js.
    // Nesse passo, peço os registros ao repositório e os organizo no campo dados, usado também pelos demais serviços.
    return consultarRegistros(categoria);
} // Termino listarCatalogo e devolvo o controle a quem chamou.

// Preparo a gravação do catálogo com as conferências necessárias e peço à persistência que fale com o repositório.
export async function salvarCatalogo(categoria, id, entrada, operacaoId) {
    // Separo o ID do item do ID do pedido: o mesmo item pode passar por várias edições.
    const registroId = exigirId(id);
    // Preparo pedidoId com esta chamada. Chamo obterIdOperacao em validar-id.js. Nesse passo, reaproveito um ID
    // válido recebido ou gero outro quando não foi enviado, preservando a referência de um reenvio.
    const pedidoId = obterIdOperacao(operacaoId);
    // Deixo a conferência de nome, preço e período na função de validação, para não repetir essas regras aqui.
    const dados = prepararCatalogo(categoria, entrada);
    // Começo sem versão anterior, porque um item novo ainda não tem uma data de atualização para comparar.
    let versao = null;

    // Leio a versão anterior quando o pedido quer editar um registro que já existe.
    if (entrada.versaoAnterior) {
        // Uso Date.parse para conferir se a versão recebida pode ser lida como data.
        if (typeof entrada.versaoAnterior !== 'string' || Number.isNaN(Date.parse(entrada.versaoAnterior))) {
            // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
            throw erroOperacao(422, 'A versão de origem é inválida.');
        } // Encerro a conferência de esta condição.

        // Padronizo a data com toISOString para comparar o mesmo instante sem diferenças de escrita. Converto a data
        // para o formato ISO em UTC, que pode ser enviado e entendido pela API.
        versao = new Date(entrada.versaoAnterior).toISOString();
    } // Encerro a conferência de entrada.versaoAnterior.

    // Entrego a versão junto dos dados para o repositório perceber se alguém já editou esse item.
    return registrarOperacao(pedidoId, 'salvar', {
        // Informo qual grupo de registros participa desta consulta ou gravação.
        categoria: categoria,
        // Informo o identificador deste registro para conseguir encontrá-lo depois.
        id: registroId,
        // Reúno o conteúdo desta operação em dados para manter o formato esperado por quem recebe.
        dados: dados,
        // Informo a versão que foi lida antes da edição para detectar uma mudança feita por outra operação.
        versaoAnterior: versao,
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino salvarCatalogo e devolvo o controle a quem chamou.
