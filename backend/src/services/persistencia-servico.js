// Consulto e gravo somente no Neon, confirmando cada operação antes de responder.
import { UniqueConstraintError } from 'sequelize';
import { executarOperacaoOnline, consultarCategoriaOnline, verificarConexaoOnline } from '../repositories/operacao-online.js';
import { prepararOperacao } from '../utils/preparar-operacao.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function verificarConexao() {
    await verificarConexaoOnline();
}

export async function consultarRegistros(categoria, aparelhoId) {
    return {
        dados: await consultarCategoriaOnline(categoria, aparelhoId),
    };
}

export async function registrarOperacao(id, tipo, entrada) {
    const operacao = prepararOperacao(id, tipo, entrada);

    try {
        return {
            dados: await executarOperacaoOnline(operacao),
        };
    } catch (falha) {
        if (falha instanceof UniqueConstraintError) {
            throw erroOperacao(409, 'Cadastro conflitante. A vinculação de CPF exige validação de identidade.');
        }

        throw falha;
    }
}
