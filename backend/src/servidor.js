// Preparo o banco e inicio o servidor HTTP no endereço definido pelo ambiente.
import banco from './config/banco.js';
import app from './aplicacao.js';
import { criarTabelas } from './config/criar-tabelas.js';

async function iniciarServidor() {
    // Defino porta e endereço locais para usar quando o ambiente não os informar.
    let porta = 3000;
    let host = '127.0.0.1';

    // Adoto os valores do .env quando eles foram preenchidos.
    if (process.env.PORTA) {
        porta = Number(process.env.PORTA);
    }

    // Permito escolher o endereço de rede pelo ambiente, inclusive para testar no celular.
    if (process.env.HOST) {
        host = process.env.HOST;
    }

    // Interrompo a inicialização quando a porta não é um número inteiro permitido.
    if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
        console.error('Informe uma PORTA válida no .env.');
        process.exitCode = 1;
        return;
    }

    try {
        // Confirmo a conexão com o banco configurado no ambiente.
        await banco.authenticate();

        // Aguardo a criação das tabelas antes de receber pedidos do frontend.
        await criarTabelas();

        // Abro o atendimento HTTP somente depois que o banco estiver preparado.
        const servidor = app.listen(porta, host, function avisarInicio() {
            console.log('API disponível em http://' + host + ':' + porta + '/api/v1');
        });

        // Encerro a conexão com o banco se o servidor não conseguir abrir a porta.
        servidor.on('error', async function avisarFalha() {
            console.error('Não foi possível abrir a porta da API.');
            await banco.close();
            process.exitCode = 1;
        });
    } catch {
        // Registro a falha de preparação sem mostrar a conexão privada do banco.
        console.error('Não foi possível preparar o banco. Confira DATABASE_URL, a conexão e a permissão para criar tabelas no Neon.');
        await banco.close();
        process.exitCode = 1;
    }
}

// Inicio a preparação do banco e do servidor ao executar este arquivo.
iniciarServidor();
