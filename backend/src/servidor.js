// Preparo o Neon e abro o servidor na porta fornecida pela hospedagem.
import banco from './config/banco.js';
import app from './aplicacao.js';
import { criarTabelas } from './config/criar-tabelas.js';
import { mensagemFalhaBanco } from './utils/mensagem-falha-banco.js';

async function encerrarBanco() {
    try {
        // Espero o close terminar para liberar as conexões que o backend abriu com o Neon.
        await banco.close();
    } catch {
        console.error('Não foi possível encerrar as conexões com o Neon.');
        process.exitCode = 1;
    }
}

async function iniciarServidor() {
    // Começo com estes valores para conseguir iniciar mesmo sem uma porta definida no ambiente.
    let porta = 3000;
    let host = '0.0.0.0';

    // Dou preferência à PORT, porque é nela que o Render espera encontrar a API.
    // Uso Number porque as variáveis de ambiente chegam como texto, mesmo quando só têm números.
    if (process.env.PORT) {
        porta = Number(process.env.PORT);
    } else if (process.env.PORTA) {
        porta = Number(process.env.PORTA);
    }

    // Só aproveito um HOST personalizado fora da produção, para não deixar o Render preso ao endereço local.
    if (process.env.HOST && process.env.RENDER !== 'true' && process.env.NODE_ENV !== 'production') {
        host = process.env.HOST;
    }

    // Confiro o número antes de abrir o servidor; uma porta inválida já merece um erro claro aqui.
    if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
        console.error('Informe PORT ou PORTA como um número inteiro entre 1 e 65535.');
        process.exitCode = 1;
        return;
    }

    try {
        // Peço ao authenticate uma consulta simples para saber se consigo falar com o banco de verdade.
        await banco.authenticate();
        console.log('Conexão com o Neon confirmada.');

        // Preservo as tabelas existentes e preparo as ausentes antes de receber requisições.
        await criarTabelas();
        console.log('Tabelas do Neon preparadas.');

        // Só chamo listen depois de preparar o banco, porque esse método começa a receber pedidos HTTP.
        const servidor = app.listen(porta, host, function avisarInicio() {
            console.log('API disponível em http://' + host + ':' + porta + '/api/v1');
        });

        // Fico de olho no evento error, já que a abertura da porta pode falhar depois da chamada a listen.
        servidor.on('error', async function avisarFalha(falha) {
            if (falha.code === 'EADDRINUSE') {
                console.error('A porta da API já está em uso. Confira PORT ou PORTA.');
            } else {
                console.error('Não foi possível abrir a API. Confira HOST e PORT.');
            }

            process.exitCode = 1;
            await encerrarBanco();
        });

        // Aguardo os pedidos em andamento antes de fechar o banco durante um novo deploy.
        let encerrando = false;

        function encerrarServidor() {
            // Evito começar o encerramento duas vezes se chegarem dois sinais seguidos.
            if (encerrando) {
                return;
            }

            encerrando = true;
            // Paro de aceitar pedidos novos e espero os que já chegaram antes de fechar o banco.
            servidor.close(async function concluirEncerramento() {
                await encerrarBanco();
            });
        }

        // Uso once para tratar cada sinal só uma vez: SIGTERM costuma vir da hospedagem e SIGINT do Ctrl+C.
        process.once('SIGTERM', encerrarServidor);
        process.once('SIGINT', encerrarServidor);
    } catch (falha) {
        // Mostro uma explicação segura do problema, sem jogar senha ou detalhes da consulta no terminal.
        console.error(mensagemFalhaBanco(falha));
        process.exitCode = 1;
        await encerrarBanco();
    }
}

// Dou o primeiro passo aqui quando o Node executa este arquivo.
iniciarServidor();
