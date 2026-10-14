// Coordeno a gravação dos lembretes e seus avisos, preservando anotações sem permissão de notificação.
// Ligo as telas de lembretes à API e aos avisos do sistema. Na criação, espero salvar online antes de agendar; na
// exclusão, espero apagar online antes de cancelar. Uma falha de aviso não transforma uma gravação concluída em perda
// de dados.

import { solicitarApi } from './api.js';
import { obterToken } from './token-servico';
import { agendarNotificacao, cancelarNotificacao, consultarNotificacoes, identificarNotificacao, solicitarPermissao } from './notificacao-servico.js';

// Envio o lembrete à API com o ID do pedido e, após a confirmação, tento agendar o aviso neste aparelho se a pessoa
// escolheu essa opção.
export async function cadastrarLembrete(dados, avisar, pedidoId) {
    // Reconheço uma troca de conta enquanto o pedido estiver esperando a rede.
    const tokenInicial = await obterToken();
    // Espero a confirmação do Neon antes de agendar o aviso neste celular. Transformo os dados em texto JSON para
    // enviar, guardar ou comparar seu conteúdo.
    const resultado = await solicitarApi('/lembretes', {
        // Escolho o método HTTP que informa à API se quero consultar, criar ou excluir dados.
        method: 'POST',
        // Junto informações do pedido, como formato JSON, sessão e identificador de repetição.
        headers: {
            // Aviso que o corpo do pedido está em JSON para o Express conseguir interpretá-lo.
            'Content-Type': 'application/json',
            // Envio o ID desta operação para o backend reconhecer uma repetição sem gravar outra cópia.
            'Idempotency-Key': pedidoId,
        }, // Concluo os campos de headers e volto ao objeto que reúne essa configuração.
        // Coloco o conteúdo que seguirá no pedido; uso JSON.stringify quando a API espera JSON.
        body: JSON.stringify(dados),
    }); // Concluo este objeto com os campos que a etapa atual precisa.
    // Guardo lembrete com resultado.dados para reutilizar esse resultado neste trecho.
    const lembrete = resultado.dados;
    // Inicio mensagem com o texto "Lembrete salvo online, sem aviso."; vou ajustar esse valor conforme as condições
    // abaixo.
    let mensagem = 'Lembrete salvo online, sem aviso.';

    // Tento preparar o aviso apenas quando a pessoa pediu a notificação.
    if (avisar) {
        // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
        // await.
        try {
            // Espero o resultado antes de preencher permitido. Chamo solicitarPermissao em notificacao-servico.js.
            // Nesse passo, preparo o canal Android, leio a permissão atual e só peço uma escolha quando o sistema
            // permite perguntar.
            const permitido = await solicitarPermissao();

            // Confiro se tokenInicial é diferente do resultado aguardado de obterToken antes de executar o bloco
            // abaixo.
            if (tokenInicial !== await obterToken()) {
                // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
                return {
                    // Entrego o lembrete confirmado pela API junto com a orientação sobre o aviso local.
                    lembrete: lembrete,
                    // Escolho a mensagem que será entregue a quem chamou este trecho.
                    mensagem: 'Lembrete salvo na conta anterior, sem aviso neste aparelho.',
                }; // Concluo este objeto com os campos que a etapa atual precisa.
            } // Encerro a conferência de tokenInicial.
            // Agendo o aviso somente depois de o sistema permitir notificações.
            if (permitido) {
                // Espero esta tarefa terminar antes de continuar. Chamo agendarNotificacao em notificacao-servico.js.
                // Nesse passo, confiro se o horário ainda está no futuro e peço ao sistema o aviso local para aquele
                // instante.
                await agendarNotificacao(lembrete);
                // Cancelo um agendamento que terminou depois da saída da conta.
                if (tokenInicial !== await obterToken()) {
                    // Espero esta tarefa terminar antes de continuar. Chamo cancelarNotificacao em
                    // notificacao-servico.js. Nesse passo, localizo o aviso pelo ID do lembrete e peço seu
                    // cancelamento no sistema.
                    await cancelarNotificacao(lembrete.id);
                    // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
                    return {
                        // Entrego o lembrete confirmado pela API junto com a orientação sobre o aviso local.
                        lembrete: lembrete,
                        // Escolho a mensagem que será entregue a quem chamou este trecho.
                        mensagem: 'Lembrete salvo na conta anterior, sem aviso neste aparelho.',
                    }; // Concluo este objeto com os campos que a etapa atual precisa.
                } // Encerro a conferência de tokenInicial.
                // Atualizo mensagem com a mensagem escrita nesta linha.
                mensagem = 'Lembrete salvo online e aviso agendado neste aparelho.';
            // Sigo este caminho quando a condição anterior não foi atendida.
            } else {
                // Atualizo mensagem com a mensagem escrita nesta linha.
                mensagem = 'Lembrete salvo, mas sem aviso. A permissão de notificações não foi concedida.';
            } // Encerro a conferência de permitido.
        // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
        } catch {
            // Confirmo a gravação já concluída, evitando que a pessoa salve uma cópia.
            mensagem = 'Lembrete salvo, mas não consegui agendar o aviso. Confira as permissões e o horário escolhido.';
        } // Termino o tratamento desta falha e sigo para a limpeza, quando houver.
    } // Encerro a conferência de avisar.

    // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
    return {
        // Entrego o lembrete confirmado pela API junto com a orientação sobre o aviso local.
        lembrete: lembrete,
        // Escolho a mensagem que será entregue a quem chamou este trecho.
        mensagem: mensagem,
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino cadastrarLembrete e devolvo o controle a quem chamou.

// Consulto os lembretes online e cruzo os IDs com os avisos deste aparelho para mostrar a situação local.
export async function listarLembretes() {
    // Busco no backend as anotações da conta identificada pela sessão.
    const resultado = await solicitarApi('/lembretes');
    // Guardo lembretes com resultado.dados para reutilizar esse resultado neste trecho.
    const lembretes = resultado.dados;
    // Reúno os itens em notificacoes para trabalhar com eles como uma lista.
    let notificacoes = [];
    // Inicio aviso com texto vazio; vou ajustar esse valor conforme as condições abaixo.
    let aviso = '';

    // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
    // await.
    try {
        // Atualizo notificacoes com o resultado aguardado de consultarNotificacoes. Chamo consultarNotificacoes em
        // notificacao-servico.js. Nesse passo, peço ao sistema os avisos agendados; esse estado pertence ao aparelho,
        // não ao cadastro no Neon.
        notificacoes = await consultarNotificacoes();
    // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
    } catch {
        // Mantenho a lista disponível mesmo se o sistema não informar os avisos.
        aviso = 'Os lembretes foram carregados, mas não consegui conferir os avisos agendados.';
    } // Termino o tratamento desta falha e sigo para a limpeza, quando houver.

    // Copio o lembrete e junto uma descrição do aviso local sem mudar o registro recebido da API.
    const dados = lembretes.map(function acrescentarSituacao(lembrete) {
        // Inicio situacao com o texto "Sem aviso agendado"; vou ajustar esse valor conforme as condições abaixo.
        let situacao = 'Sem aviso agendado';
        // Comparo o identificador de uma notificação com o lembrete para saber se há um agendamento neste aparelho.
        const agendado = notificacoes.some(function encontrarAviso(notificacao) {
            // Entrego o resultado da comparação entre notificacao.identifier e o resultado de identificarNotificacao
            // a quem chamou a função e termino este caminho.
            return notificacao.identifier === identificarNotificacao(lembrete.id);
        }); // Termino encontrarAviso e devolvo o controle a quem chamou.

        // Descrevo o agendamento sem afirmar que o aparelho entregou uma notificação.
        if (new Date(lembrete.dataHora).getTime() <= Date.now()) {
            // Atualizo situacao com o texto "Horário passado".
            situacao = 'Horário passado';
        // Confiro se aviso está disponível ou está verdadeiro antes de executar o bloco abaixo.
        } else if (aviso) {
            // Atualizo situacao com o texto "Aviso não verificado".
            situacao = 'Aviso não verificado';
        // Confiro se agendado está disponível ou está verdadeiro antes de executar o bloco abaixo.
        } else if (agendado) {
            // Atualizo situacao com o texto "Aviso agendado".
            situacao = 'Aviso agendado';
        } // Encerro a conferência de agendado.

        // Acrescento a situação numa cópia, sem mudar os dados que vieram da API. Uso Object.assign para copiar os
        // campos para um objeto; com {} no começo, preservo o objeto original.
        return Object.assign({}, lembrete, {
            // Acrescento a descrição do aviso neste aparelho sem alterar o registro salvo no Neon.
            situacao: situacao,
        }); // Concluo este objeto com os campos que a etapa atual precisa.
    }); // Termino acrescentarSituacao e devolvo o controle a quem chamou.

    // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
    return {
        // Reúno o conteúdo desta operação em dados para manter o formato esperado por quem recebe.
        dados: dados,
        // Compartilho uma orientação que a tela pode mostrar sem bloquear os dados já carregados.
        aviso: aviso,
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino listarLembretes e devolvo o controle a quem chamou.

// Excluo o lembrete online antes de retirar o aviso local; informo se o sistema não conseguir cancelar a notificação.
export async function excluirLembrete(id) {
    // Apago no banco primeiro; se a rede falhar, mantenho o aviso já agendado.
    await solicitarApi('/lembretes/' + encodeURIComponent(id), {
        // Escolho o método HTTP que informa à API se quero consultar, criar ou excluir dados.
        method: 'DELETE',
    }); // Concluo este objeto com os campos que a etapa atual precisa.

    // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
    // await.
    try {
        // Espero esta tarefa terminar antes de continuar. Chamo cancelarNotificacao em notificacao-servico.js. Nesse
        // passo, localizo o aviso pelo ID do lembrete e peço seu cancelamento no sistema.
        await cancelarNotificacao(id);
        // Devolvo texto vazio porque a operação terminou sem uma orientação adicional para a tela.
        return '';
    // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
    } catch {
        // Distingo a exclusão concluída de uma falha ao cancelar o aviso no aparelho.
        return 'Lembrete excluído online, mas não consegui cancelar o aviso neste aparelho.';
    } // Termino o tratamento desta falha e sigo para a limpeza, quando houver.
} // Termino excluirLembrete e devolvo o controle a quem chamou.
