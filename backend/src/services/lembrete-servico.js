// Valido os lembretes da conta e mantenho seus registros no Neon.
// Recebo a conta que o middleware conferiu, valido o lembrete e chamo persistencia-servico.js. A notificação do
// celular fica no frontend; aqui salvo apenas os dados do lembrete no Neon.

import { consultarRegistros, registrarOperacao } from './persistencia-servico.js';
import { exigirId, obterIdOperacao } from '../utils/validar-id.js';
import { erroOperacao } from '../utils/erro-operacao.js';

// Preparo a consulta dos lembretes da conta com as conferências necessárias e peço à persistência que fale com o
// repositório.
export async function listarLembretes(contaId) {
    // Confiro o ID da conta recebido da sessão antes de buscar os lembretes dela.
    return consultarRegistros('lembrete', exigirId(contaId));
} // Termino listarLembretes e devolvo o controle a quem chamou.

// Preparo a gravação do lembrete da conta com as conferências necessárias e peço à persistência que fale com o
// repositório.
export function salvarLembrete(entrada, contaId, operacaoId) {
    // Valido a conta e preparo o ID do pedido antes de montar o registro.
    const donoId = exigirId(contaId);
    // Preparo pedidoId com esta chamada. Chamo obterIdOperacao em validar-id.js. Nesse passo, reaproveito um ID
    // válido recebido ou gero outro quando não foi enviado, preservando a referência de um reenvio.
    const pedidoId = obterIdOperacao(operacaoId);

    // Uso trim para ignorar espaços nas pontas; um título feito só de espaços não serve como lembrete.
    if (!entrada || typeof entrada.titulo !== 'string' || !entrada.titulo.trim() || entrada.titulo.trim().length > 100) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, 'Informe um título com até 100 caracteres.');
    } // Encerro a conferência de esta condição.

    // Confiro a data antes de chamar toISOString, porque uma data inválida faria essa conversão falhar.
    if (typeof entrada.dataHora !== 'string' || Number.isNaN(Date.parse(entrada.dataHora))) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, 'Informe a data e o horário do lembrete.');
    } // Encerro a conferência de esta condição.

    // Permito horários antigos na transferência de anotações já existentes.
    return registrarOperacao(pedidoId, 'salvar', {
        // Informo qual grupo de registros participa desta consulta ou gravação.
        categoria: 'lembrete',
        // Uso o ID do pedido também no lembrete para reconhecer um reenvio da mesma criação.
        id: pedidoId,
        // Reúno o conteúdo desta operação em dados para manter o formato esperado por quem recebe.
        dados: {
            // Associo os dados à conta conferida no acesso para separar as informações de cada pessoa.
            contaId: donoId,
            // Defino o título que identifica este item para a pessoa.
            titulo: entrada.titulo.trim(),
            // Guardo o horário em texto ISO, para não depender do jeito que cada aparelho escreve uma data.
            dataHora: new Date(entrada.dataHora).toISOString(),
        }, // Concluo os campos de dados e volto ao objeto que reúne essa configuração.
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino salvarLembrete e devolvo o controle a quem chamou.

// Preparo a exclusão do lembrete da conta com as conferências necessárias e peço à persistência que fale com o
// repositório.
export async function excluirLembrete(id, contaId, operacaoId) {
    // Confiro a conta dentro da transação, inclusive quando o pedido é reenviado.
    return registrarOperacao(obterIdOperacao(operacaoId), 'excluir', {
        // Informo qual grupo de registros participa desta consulta ou gravação.
        categoria: 'lembrete',
        // Informo o identificador deste registro para conseguir encontrá-lo depois.
        id: exigirId(id),
        // Associo os dados à conta conferida no acesso para separar as informações de cada pessoa.
        contaId: exigirId(contaId),
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino excluirLembrete e devolvo o controle a quem chamou.
