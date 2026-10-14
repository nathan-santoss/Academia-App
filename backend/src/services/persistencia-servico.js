// Consulto e gravo somente no Neon, confirmando cada operação antes de responder.
// Recebo o pedido do controlador, aplico as regras e chamo os repositórios para acessar o Neon. Devolvo o resultado
// ao controlador para ele responder à tela. Sou usado por academia-controlador.js, aluno-servico.js,
// catalogo-servico.js e outros arquivos do mesmo fluxo.

import { UniqueConstraintError } from 'sequelize';
import { executarOperacaoOnline, consultarCategoriaOnline, verificarConexaoOnline } from '../repositories/operacao-online.js';
import { prepararOperacao } from '../utils/preparar-operacao.js';
import { erroOperacao } from '../utils/erro-operacao.js';

// Espero o repositório conferir o Neon antes de confirmar a saúde da API.
export async function verificarConexao() {
    // Espero o repositório testar a conexão; se ele falhar, deixo o erro seguir para o tratamento da API. Chamo
    // verificarConexaoOnline em operacao-online.js. Nesse passo, peço uma consulta simples ao Sequelize para
    // confirmar se o Neon está acessível.
    await verificarConexaoOnline();
} // Termino verificarConexao e devolvo o controle a quem chamou.

// Peço os registros ao repositório e os organizo no campo dados, usado também pelos demais serviços.
export async function consultarRegistros(categoria, contaId) {
    // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
    return {
        // Espero a consulta terminar para devolver os registros atuais do Neon.
        dados: await consultarCategoriaOnline(categoria, contaId),
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino consultarRegistros e devolvo o controle a quem chamou.

// Preparo o recibo do pedido e deixo o repositório gravar; traduzo conflitos conhecidos para uma mensagem da API.
export async function registrarOperacao(id, tipo, entrada) {
    // Monto o pedido com um resumo dos dados para conseguir comparar tentativas com o mesmo ID.
    const operacao = prepararOperacao(id, tipo, entrada);

    // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
    // await.
    try {
        // Entrego estes campos a quem chamou a função, mantendo juntos os dados deste resultado.
        return {
            // Só monto a resposta de sucesso depois que a transação foi confirmada no banco.
            dados: await executarOperacaoOnline(operacao),
        }; // Concluo este objeto com os campos que a etapa atual precisa.
    // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
    } catch (falha) {
        // Uso instanceof para reconhecer o erro que o Sequelize gera quando uma regra de valor único é violada.
        if (falha instanceof UniqueConstraintError) {
            // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
            throw erroOperacao(409, 'Cadastro conflitante. A vinculação de CPF exige validação de identidade.');
        } // Encerro a conferência de falha.

        // Repasso os outros erros, porque eu não quero transformar uma queda do banco em erro de cadastro.
        throw falha;
    } // Termino o tratamento desta falha e sigo para a limpeza, quando houver.
} // Termino registrarOperacao e devolvo o controle a quem chamou.
