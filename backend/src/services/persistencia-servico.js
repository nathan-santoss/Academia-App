// Consulto e gravo somente no Neon, confirmando cada operação antes de responder.
import { UniqueConstraintError } from 'sequelize';
import { executarOperacaoOnline, consultarCategoriaOnline, verificarConexaoOnline } from '../repositories/operacao-online.js';
import { prepararOperacao } from '../utils/preparar-operacao.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function verificarConexao() {
    // Espero o repositório testar a conexão; se ele falhar, deixo o erro seguir para o tratamento da API.
    await verificarConexaoOnline();
}

export async function consultarRegistros(categoria, aparelhoId) {
    return {
        // Espero a consulta terminar para devolver os registros atuais do Neon.
        dados: await consultarCategoriaOnline(categoria, aparelhoId),
    };
}

export async function registrarOperacao(id, tipo, entrada) {
    // Monto o pedido com um resumo dos dados para conseguir comparar tentativas com o mesmo ID.
    const operacao = prepararOperacao(id, tipo, entrada);

    try {
        return {
            // Só monto a resposta de sucesso depois que a transação foi confirmada no banco.
            dados: await executarOperacaoOnline(operacao),
        };
    } catch (falha) {
        // Uso instanceof para reconhecer o erro que o Sequelize gera quando uma regra de valor único é violada.
        if (falha instanceof UniqueConstraintError) {
            throw erroOperacao(409, 'Cadastro conflitante. A vinculação de CPF exige validação de identidade.');
        }

        // Repasso os outros erros, porque eu não quero transformar uma queda do banco em erro de cadastro.
        throw falha;
    }
}
