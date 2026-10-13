// Aplico cada escrita e seu recibo na mesma transação para tornar o reenvio seguro.
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
    if (categoria === 'lembrete') {
        return Lembrete;
    }

    if (categoria === 'plano') {
        return Plano;
    }

    if (categoria === 'modalidade') {
        return Modalidade;
    }

    throw erroOperacao(422, 'Categoria não reconhecida.');
}

async function gravarAluno(entrada, transacao) {
    const dados = entrada.dados;
    // Salvo a pessoa primeiro com create, porque o perfil de aluno vai precisar do ID dela.
    const pessoa = await Pessoa.create({
        id: entrada.pessoaId,
        nome: dados.nome,
        cpf: dados.cpf,
        dataNascimento: dados.dataNascimento,
        email: dados.email,
        telefone: dados.telefone,
    }, {
        transaction: transacao,
    });

    // Deixo a geração da matrícula para a sequência do Neon.
    const aluno = await Aluno.create({
        id: entrada.id,
        pessoaId: pessoa.id,
        fotoUrl: dados.fotoUrl,
        contatoEmergencia: dados.contatoEmergencia,
    }, {
        transaction: transacao,
    });
    // Junto a pessoa que acabei de salvar ao aluno, assim eu formato a resposta sem consultar tudo de novo.
    aluno.pessoa = pessoa;
    return apresentarAluno(aluno);
}

async function gravarRegistro(operacao, transacao) {
    const entrada = operacao.entrada;
    const modelo = modeloDaCategoria(entrada.categoria);
    // Procuro pela chave principal com findByPk; se o registro existir, eu o bloqueio para esta transação.
    // Uso LOCK.UPDATE para outra edição esperar enquanto decido o que fazer com esse registro.
    const existente = await modelo.findByPk(entrada.id, {
        transaction: transacao,
        lock: transacao.LOCK.UPDATE,
    });

    if (operacao.tipo === 'excluir') {
        // Confiro a instalação dona do lembrete antes de remover a anotação.
        if (!existente) {
            throw erroOperacao(404, 'Lembrete não encontrado nesta instalação.');
        }

        if (existente.aparelhoId !== entrada.aparelhoId) {
            throw erroOperacao(403, 'Este lembrete pertence a outra instalação.');
        }

        if (existente) {
            // Chamo destroy para excluir a linha do banco, ainda dentro da mesma transação.
            await existente.destroy({
                transaction: transacao,
            });
        }

        return {
            id: entrada.id,
            excluido: true,
        };
    }

    if (existente) {
        // Recuso a edição antiga quando outro pedido já mudou o registro no Neon.
        if (!entrada.versaoAnterior || existente.atualizadoEm.toISOString() !== entrada.versaoAnterior) {
            throw erroOperacao(409, 'O registro foi alterado. Atualize os dados antes de editar novamente.');
        }

        // Passo os campos validados ao update para mudar o registro que já encontrei.
        await existente.update(entrada.dados, {
            transaction: transacao,
        });
        // Converto o modelo em um objeto com toJSON, para responder com os dados sem os métodos do Sequelize.
        return existente.toJSON();
    }

    // Se o cliente trouxe uma versão antiga mas o registro sumiu, eu não recrio o item sem avisar.
    if (entrada.versaoAnterior) {
        throw erroOperacao(409, 'O registro original não está mais disponível.');
    }

    // Uso Object.assign com um objeto vazio para juntar os dados e o ID sem alterar o objeto recebido.
    const registro = await modelo.create(Object.assign({}, entrada.dados, {
        id: entrada.id,
    }), {
        transaction: transacao,
    });
    return registro.toJSON();
}

async function consultarRecibo(operacao, transacao) {
    // Procuro o recibo pelo ID do pedido para saber se ele já foi concluído em outra tentativa.
    const recibo = await OperacaoRecebida.findByPk(operacao.id, {
        transaction: transacao,
    });

    // Comparo o resumo dos dados, porque o mesmo ID não pode representar dois pedidos diferentes.
    if (recibo && recibo.resumo !== operacao.resumo) {
        throw erroOperacao(409, 'O identificador desta operação já foi usado com outros dados.');
    }

    return recibo;
}

export async function executarOperacaoOnline(operacao) {
    try {
        // Uso uma transação para salvar tudo junto: ou os dados e o recibo são confirmados, ou nada fica salvo.
        // Com esse formato, deixo o Sequelize confirmar ao terminar ou desfazer se a função lançar um erro.
        return await banco.transaction(async function gravarComRecibo(transacao) {
            const recibo = await consultarRecibo(operacao, transacao);

            // Devolvo o resultado já guardado quando o pedido é repetido, sem cadastrar o mesmo dado outra vez.
            if (recibo) {
                return recibo.resultado;
            }

            let resultado;

            if (operacao.entrada.categoria === 'aluno') {
                resultado = await gravarAluno(operacao.entrada, transacao);
            } else {
                resultado = await gravarRegistro(operacao, transacao);
            }

            // Guardo a resposta junto com o pedido para ter o que devolver se a confirmação se perder na rede.
            await OperacaoRecebida.create({
                id: operacao.id,
                resumo: operacao.resumo,
                resultado: resultado,
            }, {
                transaction: transacao,
            });

            return resultado;
        });
    } catch (falha) {
        // Recupero a confirmação quando dois pedidos iguais chegaram ao mesmo tempo.
        if (falha instanceof UniqueConstraintError || falha.statusOperacao === 409 || falha.statusOperacao === 404) {
            const recibo = await consultarRecibo(operacao);

            if (recibo) {
                return recibo.resultado;
            }
        }

        throw falha;
    }
}

export async function consultarCategoriaOnline(categoria, aparelhoId) {
    const filtro = {};

    if (categoria === 'lembrete') {
        // Filtro pelo aparelho antes da consulta, para não carregar lembretes de outras instalações.
        filtro.aparelhoId = aparelhoId;
    }

    // Uso findAll para buscar os registros desse filtro e order para manter os mais antigos primeiro.
    const registros = await modeloDaCategoria(categoria).findAll({
        where: filtro,
        order: [['criadoEm', 'ASC']],
    });
    // Percorro os resultados com map e transformo cada modelo em um objeto simples para a resposta.
    return registros.map(function apresentar(registro) {
        return registro.toJSON();
    });
}

export async function verificarConexaoOnline() {
    // Faço uma consulta simples com authenticate para confirmar que a conexão ainda está funcionando.
    await banco.authenticate();
}
