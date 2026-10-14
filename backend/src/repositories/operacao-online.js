// Aplico cada escrita e seu recibo na mesma transação para tornar o reenvio seguro.
// Recebo o pedido preparado por persistencia-servico.js. Consulto o recibo, faço a mudança e guardo a resposta na
// mesma transação; numa repetição, consigo devolver o que já foi confirmado.

import { UniqueConstraintError } from 'sequelize';
import banco from '../config/banco.js';
import OperacaoRecebida from '../models/operacao-recebida.js';
import Pessoa from '../models/pessoa.js';
import Aluno from '../models/aluno.js';
import Lembrete from '../models/lembrete.js';
import Plano from '../models/plano.js';
import Modalidade from '../models/modalidade.js';
import { apresentarAluno } from '../utils/formatar-aluno.js';
import { erroOperacao } from '../utils/erro-operacao.js';

// Escolho o modelo pelo nome da categoria, para o restante da operação usar a tabela certa.
export function modeloDaCategoria(categoria) {
    // Confiro se categoria é igual ao texto "lembrete" antes de executar o bloco abaixo.
    if (categoria === 'lembrete') {
        // Entrego Lembrete a quem chamou a função e termino este caminho.
        return Lembrete;
    } // Encerro a conferência de categoria.

    // Confiro se categoria é igual ao texto "plano" antes de executar o bloco abaixo.
    if (categoria === 'plano') {
        // Entrego Plano a quem chamou a função e termino este caminho.
        return Plano;
    } // Encerro a conferência de categoria.

    // Confiro se categoria é igual ao texto "modalidade" antes de executar o bloco abaixo.
    if (categoria === 'modalidade') {
        // Entrego Modalidade a quem chamou a função e termino este caminho.
        return Modalidade;
    } // Encerro a conferência de categoria.

    // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
    throw erroOperacao(422, 'Categoria não reconhecida.');
} // Termino modeloDaCategoria e devolvo o controle a quem chamou.

// Salvo primeiro a pessoa e depois seu perfil de aluno, usando a transação que recebi para confirmar os dois juntos.
export async function gravarAluno(entrada, transacao) {
    // Guardo dados com entrada.dados para reutilizar esse resultado neste trecho.
    const dados = entrada.dados;
    // Salvo a pessoa primeiro com create, porque o perfil de aluno vai precisar do ID dela.
    const pessoa = await Pessoa.create({
        // Informo o identificador deste registro para conseguir encontrá-lo depois.
        id: entrada.pessoaId,
        // Preencho o nome usado para apresentar ou identificar este registro.
        nome: dados.nome,
        // Preencho o CPF com o valor preparado para o cadastro.
        cpf: dados.cpf,
        // Mantenho o nascimento em ano-mês-dia para a API e o banco interpretarem a mesma data.
        dataNascimento: dados.dataNascimento,
        // Preencho o e-mail com o valor preparado para este cadastro ou consulta.
        email: dados.email,
        // Uso o telefone preparado para manter a mesma escrita no cadastro.
        telefone: dados.telefone,
    }, { // Concluo este objeto com os campos que a etapa atual precisa.
        // Uso a mesma transação recebida para esta consulta ou gravação participar da confirmação conjunta.
        transaction: transacao,
    }); // Concluo este objeto com os campos que a etapa atual precisa.

    // Deixo a geração da matrícula para a sequência do Neon.
    const aluno = await Aluno.create({
        // Informo o identificador deste registro para conseguir encontrá-lo depois.
        id: entrada.id,
        // Ligo este registro à pessoa que reúne os dados pessoais.
        pessoaId: pessoa.id,
        // Informo o endereço da foto; a imagem será carregada pelo aplicativo quando necessário.
        fotoUrl: dados.fotoUrl,
        // Reúno o contato opcional de emergência separado dos dados do próprio aluno.
        contatoEmergencia: dados.contatoEmergencia,
    }, { // Concluo este objeto com os campos que a etapa atual precisa.
        // Uso a mesma transação recebida para esta consulta ou gravação participar da confirmação conjunta.
        transaction: transacao,
    }); // Concluo este objeto com os campos que a etapa atual precisa.
    // Junto a pessoa que acabei de salvar ao aluno, assim eu formato a resposta sem consultar tudo de novo.
    aluno.pessoa = pessoa;
    // Devolvo o resultado desta chamada a quem pediu esta etapa. Chamo apresentarAluno em formatar-aluno.js. Nesse
    // passo, completo o resumo com os dados pessoais usados na consulta individual do cadastro.
    return apresentarAluno(aluno);
} // Termino gravarAluno e devolvo o controle a quem chamou.

// Procuro o registro, confiro dono e versão quando necessário e então escolho entre criar, atualizar ou excluir.
async function gravarRegistro(operacao, transacao) {
    // Guardo entrada com operacao.entrada para reutilizar esse resultado neste trecho.
    const entrada = operacao.entrada;
    // Preparo modelo com esta chamada. Escolho um dos modelos conhecidos pelo nome da categoria; não trato esse texto
    // como um nome livre de tabela.
    const modelo = modeloDaCategoria(entrada.categoria);
    // Procuro pela chave principal com findByPk; se o registro existir, eu o bloqueio para esta transação. Uso
    // LOCK.UPDATE para outra edição esperar enquanto decido o que fazer com esse registro.
    const existente = await modelo.findByPk(entrada.id, {
        // Uso a mesma transação recebida para esta consulta ou gravação participar da confirmação conjunta.
        transaction: transacao,
        // Bloqueio o registro durante esta transação para outra alteração esperar antes de usar a mesma linha.
        lock: transacao.LOCK.UPDATE,
    }); // Concluo este objeto com os campos que a etapa atual precisa.

    // Confiro a propriedade também nas tentativas de editar um ID já existente.
    if (existente && entrada.categoria === 'lembrete' && operacao.tipo !== 'excluir' && existente.contaId !== entrada.dados.contaId) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(403, 'Este lembrete pertence a outra conta.');
    } // Encerro a conferência de esta condição.

    // Confiro se operacao.tipo é igual ao texto "excluir" antes de executar o bloco abaixo.
    if (operacao.tipo === 'excluir') {
        // Confiro a conta dona do lembrete antes de remover a anotação.
        if (!existente) {
            // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
            throw erroOperacao(404, 'Lembrete não encontrado nesta conta.');
        } // Encerro a conferência de existente.

        // Confiro se existente.contaId é diferente de entrada.contaId antes de executar o bloco abaixo.
        if (existente.contaId !== entrada.contaId) {
            // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
            throw erroOperacao(403, 'Este lembrete pertence a outra conta.');
        } // Encerro a conferência de existente.contaId.

        // Sigo o caminho do registro já encontrado, usando a mesma transação desta operação.
        if (existente) {
            // Chamo destroy para excluir a linha do banco, ainda dentro da mesma transação.
            await existente.destroy({
                // Uso a mesma transação recebida para esta consulta ou gravação participar da confirmação conjunta.
                transaction: transacao,
            }); // Concluo este objeto com os campos que a etapa atual precisa.
        } // Encerro a conferência de existente.

        // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
        return {
            // Informo o identificador deste registro para conseguir encontrá-lo depois.
            id: entrada.id,
            // Confirmo que a exclusão foi atendida para a tela atualizar a lista.
            excluido: true,
        }; // Concluo este objeto com os campos que a etapa atual precisa.
    } // Encerro a conferência de operacao.tipo.

    // Sigo o caminho do registro já encontrado, usando a mesma transação desta operação.
    if (existente) {
        // Recuso a edição antiga quando outro pedido já mudou o registro no Neon.
        if (!entrada.versaoAnterior || existente.atualizadoEm.toISOString() !== entrada.versaoAnterior) {
            // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
            throw erroOperacao(409, 'O registro foi alterado. Atualize os dados antes de editar novamente.');
        } // Encerro a conferência de esta condição.

        // Passo os campos validados ao update para mudar o registro que já encontrei.
        await existente.update(entrada.dados, {
            // Uso a mesma transação recebida para esta consulta ou gravação participar da confirmação conjunta.
            transaction: transacao,
        }); // Concluo este objeto com os campos que a etapa atual precisa.
        // Converto o modelo em um objeto com toJSON, para responder com os dados sem os métodos do Sequelize.
        return existente.toJSON();
    } // Encerro a conferência de existente.

    // Se o cliente trouxe uma versão antiga mas o registro sumiu, eu não recrio o item sem avisar.
    if (entrada.versaoAnterior) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(409, 'O registro original não está mais disponível.');
    } // Encerro a conferência de entrada.versaoAnterior.

    // Uso Object.assign com um objeto vazio para juntar os dados e o ID sem alterar o objeto recebido.
    const registro = await modelo.create(Object.assign({}, entrada.dados, {
        // Informo o identificador deste registro para conseguir encontrá-lo depois.
        id: entrada.id,
    }), { // Concluo os campos do novo registro e começo as opções que o ligam à transação.
        // Uso a mesma transação recebida para esta consulta ou gravação participar da confirmação conjunta.
        transaction: transacao,
    }); // Concluo este objeto com os campos que a etapa atual precisa.
    // Devolvo o resultado desta chamada a quem pediu esta etapa. Transformo a instância do Sequelize num objeto
    // comum, sem os métodos internos do modelo.
    return registro.toJSON();
} // Termino gravarRegistro e devolvo o controle a quem chamou.

// Procuro a resposta de uma operação anterior e comparo seu conteúdo antes de reaproveitá-la.
async function consultarRecibo(operacao, transacao) {
    // Procuro o recibo pelo ID do pedido para saber se ele já foi concluído em outra tentativa.
    const recibo = await OperacaoRecebida.findByPk(operacao.id, {
        // Uso a mesma transação recebida para esta consulta ou gravação participar da confirmação conjunta.
        transaction: transacao,
    }); // Concluo este objeto com os campos que a etapa atual precisa.

    // Comparo o resumo dos dados, porque o mesmo ID não pode representar dois pedidos diferentes.
    if (recibo && recibo.resumo !== operacao.resumo) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(409, 'O identificador desta operação já foi usado com outros dados.');
    } // Encerro a conferência de recibo.

    // Entrego recibo a quem chamou a função e termino este caminho.
    return recibo;
} // Termino consultarRecibo e devolvo o controle a quem chamou.

// Mantenho mudança e recibo na mesma transação para reconhecer um reenvio sem duplicar a gravação.
export async function executarOperacaoOnline(operacao) {
    // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
    // await.
    try {
        // Uso uma transação para salvar tudo junto: ou os dados e o recibo são confirmados, ou nada fica salvo. Com
        // esse formato, deixo o Sequelize confirmar ao terminar ou desfazer se a função lançar um erro.
        return await banco.transaction(async function gravarComRecibo(transacao) {
            // Espero o resultado antes de preencher recibo. Procuro a resposta de uma operação anterior e comparo seu
            // conteúdo antes de reaproveitá-la.
            const recibo = await consultarRecibo(operacao, transacao);

            // Devolvo o resultado já guardado quando o pedido é repetido, sem cadastrar o mesmo dado outra vez.
            if (recibo) {
                // Entrego recibo.resultado a quem chamou a função e termino este caminho.
                return recibo.resultado;
            } // Encerro a conferência de recibo.

            // Reservo resultado para receber o resultado mais adiante, dentro deste fluxo.
            let resultado;

            // Confiro se operacao.entrada.categoria é igual ao texto "aluno" antes de executar o bloco abaixo.
            if (operacao.entrada.categoria === 'aluno') {
                // Atualizo resultado com o resultado aguardado de gravarAluno. Salvo primeiro a pessoa e depois seu
                // perfil de aluno, usando a transação que recebi para confirmar os dois juntos.
                resultado = await gravarAluno(operacao.entrada, transacao);
            // Sigo este caminho quando a condição anterior não foi atendida.
            } else {
                // Atualizo resultado com o resultado aguardado de gravarRegistro. Procuro o registro, confiro dono e
                // versão quando necessário e então escolho entre criar, atualizar ou excluir.
                resultado = await gravarRegistro(operacao, transacao);
            } // Encerro a conferência de operacao.entrada.categoria.

            // Guardo a resposta junto com o pedido para ter o que devolver se a confirmação se perder na rede.
            await OperacaoRecebida.create({
                // Informo o identificador deste registro para conseguir encontrá-lo depois.
                id: operacao.id,
                // Registro o resumo do conteúdo para conferir se um reenvio representa o mesmo pedido.
                resumo: operacao.resumo,
                // Guardo o resultado desta operação para devolver uma resposta consistente.
                resultado: resultado,
            }, { // Concluo este objeto com os campos que a etapa atual precisa.
                // Uso a mesma transação recebida para esta consulta ou gravação participar da confirmação conjunta.
                transaction: transacao,
            }); // Concluo este objeto com os campos que a etapa atual precisa.

            // Entrego resultado a quem chamou a função e termino este caminho.
            return resultado;
        }); // Termino gravarComRecibo e devolvo o controle a quem chamou.
    // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
    } catch (falha) {
        // Recupero a confirmação quando dois pedidos iguais chegaram ao mesmo tempo.
        if (falha instanceof UniqueConstraintError || falha.statusOperacao === 409 || falha.statusOperacao === 404) {
            // Espero o resultado antes de preencher recibo. Procuro a resposta de uma operação anterior e comparo seu
            // conteúdo antes de reaproveitá-la.
            const recibo = await consultarRecibo(operacao);

            // Aproveito a confirmação existente para responder sem repetir a gravação.
            if (recibo) {
                // Entrego recibo.resultado a quem chamou a função e termino este caminho.
                return recibo.resultado;
            } // Encerro a conferência de recibo.
        } // Encerro a conferência de esta condição.

        // Passo a falha adiante para o tratamento de quem chamou, preservando sua mensagem e seu tipo.
        throw falha;
    } // Termino o tratamento desta falha e sigo para a limpeza, quando houver.
} // Termino executarOperacaoOnline e devolvo o controle a quem chamou.

// Monto o filtro da categoria e peço ao modelo os registros que podem voltar para o serviço.
export async function consultarCategoriaOnline(categoria, contaId) {
    // Monto filtro como um objeto para agrupar os campos desta etapa.
    const filtro = {};

    // Confiro se categoria é igual ao texto "lembrete" antes de executar o bloco abaixo.
    if (categoria === 'lembrete') {
        // Filtro pela conta antes da consulta, para não carregar lembretes de outras contas.
        filtro.contaId = contaId;
    } // Encerro a conferência de categoria.

    // Uso findAll para buscar os registros desse filtro e order para manter os mais antigos primeiro.
    const registros = await modeloDaCategoria(categoria).findAll({
        // Monto as condições que limitam quais registros o banco pode consultar ou alterar.
        where: filtro,
        // Defino a ordenação no banco para a lista seguir uma sequência previsível.
        order: [['criadoEm', 'ASC']],
    }); // Concluo este objeto com os campos que a etapa atual precisa.
    // Percorro os resultados com map e transformo cada modelo em um objeto simples para a resposta.
    return registros.map(function apresentar(registro) {
        // Devolvo o resultado desta chamada a quem pediu esta etapa. Transformo a instância do Sequelize num objeto
        // comum, sem os métodos internos do modelo.
        return registro.toJSON();
    }); // Termino apresentar e devolvo o controle a quem chamou.
} // Termino consultarCategoriaOnline e devolvo o controle a quem chamou.

// Peço uma consulta simples ao Sequelize para confirmar se o Neon está acessível.
export async function verificarConexaoOnline() {
    // Faço uma consulta simples com authenticate para confirmar que a conexão ainda está funcionando.
    await banco.authenticate();
} // Termino verificarConexaoOnline e devolvo o controle a quem chamou.
