// Preparo o Neon e abro o servidor na porta fornecida pela hospedagem.
// Começo aqui quando npm start executa este arquivo: confiro o Neon, preparo as tabelas e só então abro a porta.
// Depois disso, deixo aplicacao.js receber os pedidos dos celulares.

import banco from './config/banco.js';
import app from './aplicacao.js';
import { criarTabelas } from './config/criar-tabelas.js';
import { mensagemFalhaBanco } from './utils/mensagem-falha-banco.js';

// Fecho as conexões do Sequelize quando o servidor termina, para não deixar recursos abertos.
async function encerrarBanco() {
    // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
    // await.
    try {
        // Espero o close terminar para liberar as conexões que o backend abriu com o Neon.
        await banco.close();
    // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
    } catch {
        // Registro esta orientação no terminal para ajudar a localizar a falha.
        console.error('Não foi possível encerrar as conexões com o Neon.');
        // Atualizo process.exitCode com 1.
        process.exitCode = 1;
    } // Termino o tratamento desta falha e sigo para a limpeza, quando houver.
} // Termino encerrarBanco e devolvo o controle a quem chamou.

// Organizo a abertura da API: valido a porta, confiro a conexão, preparo as tabelas e começo a escutar pedidos.
async function iniciarServidor() {
    // Começo com estes valores para conseguir iniciar mesmo sem uma porta definida no ambiente.
    let porta = 3000;
    // Inicio host com o texto "0.0.0.0"; vou ajustar esse valor conforme as condições abaixo.
    let host = '0.0.0.0';

    // Dou preferência à PORT, porque é nela que o Render espera encontrar a API. Uso Number porque as variáveis de
    // ambiente chegam como texto, mesmo quando só têm números.
    if (process.env.PORT) {
        // Atualizo porta com o resultado de Number. Converto o valor para número antes de fazer contas ou validar
        // limites.
        porta = Number(process.env.PORT);
    // Confiro se process.env.PORTA está disponível ou está verdadeiro antes de executar o bloco abaixo.
    } else if (process.env.PORTA) {
        // Atualizo porta com o resultado de Number. Converto o valor para número antes de fazer contas ou validar
        // limites.
        porta = Number(process.env.PORTA);
    } // Encerro a conferência de process.env.PORTA.

    // Só aproveito um HOST personalizado fora da produção, para não deixar o Render preso ao endereço local.
    if (process.env.HOST && process.env.RENDER !== 'true' && process.env.NODE_ENV !== 'production') {
        // Atualizo host com process.env.HOST.
        host = process.env.HOST;
    } // Encerro a conferência de esta condição.

    // Confiro o número antes de abrir o servidor; uma porta inválida já merece um erro claro aqui.
    if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
        // Registro esta orientação no terminal para ajudar a localizar a falha.
        console.error('Informe PORT ou PORTA como um número inteiro entre 1 e 65535.');
        // Atualizo process.exitCode com 1.
        process.exitCode = 1;
        // Termino esta chamada aqui para não executar os próximos passos deste caminho.
        return;
    } // Encerro a conferência de esta condição.

    // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
    // await.
    try {
        // Peço ao authenticate uma consulta simples para saber se consigo falar com o banco de verdade.
        await banco.authenticate();
        // Mostro esta informação no terminal para acompanhar a execução do servidor.
        console.log('Conexão com o Neon confirmada.');

        // Preservo as tabelas existentes e preparo as ausentes antes de receber requisições.
        await criarTabelas();
        // Mostro esta informação no terminal para acompanhar a execução do servidor.
        console.log('Tabelas do Neon preparadas.');

        // Só chamo listen depois de preparar o banco, porque esse método começa a receber pedidos HTTP.
        const servidor = app.listen(porta, host, function avisarInicio() {
            // Mostro esta informação no terminal para acompanhar a execução do servidor.
            console.log('API disponível em http://' + host + ':' + porta + '/api/v1');
        }); // Termino avisarInicio e devolvo o controle a quem chamou.

        // Fico de olho no evento error, já que a abertura da porta pode falhar depois da chamada a listen.
        servidor.on('error', async function avisarFalha(falha) {
            // Confiro se falha.code é igual ao texto "EADDRINUSE" antes de executar o bloco abaixo.
            if (falha.code === 'EADDRINUSE') {
                // Registro esta orientação no terminal para ajudar a localizar a falha.
                console.error('A porta da API já está em uso. Confira PORT ou PORTA.');
            // Sigo este caminho quando a condição anterior não foi atendida.
            } else {
                // Registro esta orientação no terminal para ajudar a localizar a falha.
                console.error('Não foi possível abrir a API. Confira HOST e PORT.');
            } // Encerro a conferência de falha.code.

            // Atualizo process.exitCode com 1.
            process.exitCode = 1;
            // Espero esta tarefa terminar antes de continuar. Fecho as conexões do Sequelize quando o servidor
            // termina, para não deixar recursos abertos.
            await encerrarBanco();
        }); // Termino avisarFalha e devolvo o controle a quem chamou.

        // Aguardo os pedidos em andamento antes de fechar o banco durante um novo deploy.
        let encerrando = false;

        // Inicio uma saída organizada: paro os pedidos novos e espero os que já começaram antes de fechar o banco.
        function encerrarServidor() {
            // Evito começar o encerramento duas vezes se chegarem dois sinais seguidos.
            if (encerrando) {
                // Termino esta chamada aqui para não executar os próximos passos deste caminho.
                return;
            } // Encerro a conferência de encerrando.

            // Atualizo encerrando com true.
            encerrando = true;
            // Paro de aceitar pedidos novos e espero os que já chegaram antes de fechar o banco.
            servidor.close(async function concluirEncerramento() {
                // Espero esta tarefa terminar antes de continuar. Fecho as conexões do Sequelize quando o servidor
                // termina, para não deixar recursos abertos.
                await encerrarBanco();
            }); // Termino concluirEncerramento e devolvo o controle a quem chamou.
        } // Termino encerrarServidor e devolvo o controle a quem chamou.

        // Uso once para tratar cada sinal só uma vez: SIGTERM costuma vir da hospedagem e SIGINT do Ctrl+C.
        process.once('SIGTERM', encerrarServidor);
        // Registro uma função que será chamada apenas na primeira ocorrência deste evento.
        process.once('SIGINT', encerrarServidor);
    // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
    } catch (falha) {
        // Mostro uma explicação segura do problema, sem jogar senha ou detalhes da consulta no terminal.
        console.error(mensagemFalhaBanco(falha));
        // Atualizo process.exitCode com 1.
        process.exitCode = 1;
        // Espero esta tarefa terminar antes de continuar. Fecho as conexões do Sequelize quando o servidor termina,
        // para não deixar recursos abertos.
        await encerrarBanco();
    } // Termino o tratamento desta falha e sigo para a limpeza, quando houver.
} // Termino iniciarServidor e devolvo o controle a quem chamou.

// Dou o primeiro passo aqui quando o Node executa este arquivo.
iniciarServidor();
