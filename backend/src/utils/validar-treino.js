import { exigirNumero } from './validar-rotina.js';
import { exigirId } from './validar-id.js';
import { erroOperacao } from './erro-operacao.js';

export function validarSeries(entrada, referencia) {
    if (!Array.isArray(entrada) || entrada.length > 600) {
        throw erroOperacao(422, 'Envie as séries realizadas neste treino.');
    }
    const identificadores = new Set();
    return entrada.map(function validarSerie(serie) {
        if (!serie) {
            throw erroOperacao(422, 'Série inválida.');
        }
        const exercicioId = exigirId(serie.exercicioId);
        const exercicio = referencia.divisao.exercicios.find(function encontrar(item) {
            return item.id === exercicioId;
        });
        if (!exercicio) {
            throw erroOperacao(422, 'O exercício não pertence à referência deste treino.');
        }
        const numero = exigirNumero(serie.numero, 'número da série', 1, exercicio.series);
        const id = exercicioId + ':' + numero;
        if (identificadores.has(id)) {
            throw erroOperacao(422, 'A mesma série foi informada mais de uma vez.');
        }
        identificadores.add(id);
        return {
            exercicioId: exercicioId,
            numero: numero,
            carga: exigirNumero(serie.carga, 'carga realizada em kg', 0, 2000, false),
            realizado: exigirNumero(serie.realizado, 'repetições ou segundos realizados', 1, 36000),
        };
    });
}

export function obterEstadoTreino(encerrar, series, referencia) {
    if (typeof encerrar !== 'boolean') {
        throw erroOperacao(422, 'Informe se deseja encerrar o treino.');
    }
    if (!encerrar) {
        return 'ativo';
    }
    const quantidade = referencia.divisao.exercicios.reduce(function somar(total, exercicio) {
        return total + exercicio.series;
    }, 0);
    if (series.length === quantidade) {
        return 'completo';
    }
    return 'parcial';
}
