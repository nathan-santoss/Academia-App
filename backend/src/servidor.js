// Preparo o Neon e abro o servidor na porta fornecida pela hospedagem.
import banco from './config/banco.js';
import app from './aplicacao.js';
import { criarTabelas } from './config/criar-tabelas.js';
import { mensagemFalhaBanco } from './utils/mensagem-falha-banco.js';

async function encerrarBanco() {
    try {
        await banco.close();
    } catch {
        console.error('Não foi possível encerrar as conexões com o Neon.');
        process.exitCode = 1;
    }
}

async function iniciarServidor() {
    let porta = 3000;
    let host = '0.0.0.0';

    // Priorizo PORT do Render e mantenho PORTA para ambientes já configurados.
    if (process.env.PORT) {
        porta = Number(process.env.PORT);
    } else if (process.env.PORTA) {
        porta = Number(process.env.PORTA);
    }

    if (process.env.HOST && process.env.RENDER !== 'true' && process.env.NODE_ENV !== 'production') {
        host = process.env.HOST;
    }

    if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
        console.error('Informe PORT ou PORTA como um número inteiro entre 1 e 65535.');
        process.exitCode = 1;
        return;
    }

    try {
        await banco.authenticate();
        console.log('Conexão com o Neon confirmada.');

        // Preservo as tabelas existentes e preparo as ausentes antes de receber requisições.
        await criarTabelas();
        console.log('Tabelas do Neon preparadas.');

        const servidor = app.listen(porta, host, function avisarInicio() {
            console.log('API disponível em http://' + host + ':' + porta + '/api/v1');
        });

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
            if (encerrando) {
                return;
            }

            encerrando = true;
            servidor.close(async function concluirEncerramento() {
                await encerrarBanco();
            });
        }

        process.once('SIGTERM', encerrarServidor);
        process.once('SIGINT', encerrarServidor);
    } catch (falha) {
        console.error(mensagemFalhaBanco(falha));
        process.exitCode = 1;
        await encerrarBanco();
    }
}

iniciarServidor();
