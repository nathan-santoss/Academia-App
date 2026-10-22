import { exigirDia } from './validar-financeiro.js';
import { exigirNumero } from './validar-rotina.js';
import { diaAcademia } from './dia-academia.js';
import { erroOperacao } from './erro-operacao.js';

export function validarMedida(entrada) {
    if (!entrada || !['peso', 'altura'].includes(entrada.tipo)) {
        throw erroOperacao(422, 'Escolha peso em kg ou altura em centímetros.');
    }
    const dia = exigirDia(entrada.dia);
    if (dia > diaAcademia()) {
        throw erroOperacao(422, 'A medição não pode estar no futuro.');
    }
    return {
        tipo: entrada.tipo,
        valor: exigirNumero(entrada.valor, 'valor da medida', 0.01, 99999.99, false),
        dia: dia,
    };
}
