import { erroOperacao } from './erro-operacao.js';
import { exigirId } from './validar-id.js';

export function exigirTexto(valor, nome, limite = 100) {
    if (typeof valor !== 'string' || !valor.trim() || valor.trim().length > limite) {
        throw erroOperacao(422, 'Confira o campo ' + nome + '.');
    }
    return valor.trim();
}

export function exigirNumero(valor, nome, minimo, maximo, inteiro = true) {
    if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < minimo || valor > maximo) {
        throw erroOperacao(422, 'Confira o campo ' + nome + '.');
    }
    if (inteiro && !Number.isInteger(valor)) {
        throw erroOperacao(422, nome + ' precisa ser um número inteiro.');
    }
    return valor;
}

function validarExercicio(exercicio) {
    if (!exercicio || !['repeticoes', 'duracao'].includes(exercicio.tipo)) {
        throw erroOperacao(422, 'Escolha repetições ou duração para cada exercício.');
    }
    let carga = null;
    if (exercicio.carga !== null && exercicio.carga !== undefined) {
        carga = exigirNumero(exercicio.carga, 'carga sugerida', 0, 2000, false);
    }
    let observacoes = '';
    if (exercicio.observacoes) {
        observacoes = exigirTexto(exercicio.observacoes, 'observações', 500);
    }
    const resultado = {
        id: exigirId(exercicio.id),
        nome: exigirTexto(exercicio.nome, 'nome do exercício'),
        equipamento: exigirTexto(exercicio.equipamento, 'equipamento ou peso corporal'),
        referenciaCarga: exigirTexto(exercicio.referenciaCarga, 'referência da carga', 60),
        tipo: exercicio.tipo,
        series: exigirNumero(exercicio.series, 'séries', 1, 20),
        meta: exigirNumero(exercicio.meta, 'repetições ou segundos', 1, 36000),
        carga: carga,
        descanso: exigirNumero(exercicio.descanso, 'descanso em segundos', 0, 3600),
        observacoes: observacoes,
    };
    if (exercicio.exercicioCatalogoId !== undefined && exercicio.exercicioCatalogoId !== null) {
        resultado.exercicioCatalogoId = exigirId(exercicio.exercicioCatalogoId);
    }
    return resultado;
}

export function validarRotina(entrada) {
    if (!entrada || !Array.isArray(entrada.divisoes) || entrada.divisoes.length < 1 || entrada.divisoes.length > 10) {
        throw erroOperacao(422, 'Informe de 1 a 10 divisões para a rotina.');
    }
    const identificadores = new Set();
    const divisoes = entrada.divisoes.map(function validarDivisao(divisao) {
        if (!divisao || !Array.isArray(divisao.exercicios) || divisao.exercicios.length < 1 || divisao.exercicios.length > 30) {
            throw erroOperacao(422, 'Cada divisão precisa ter de 1 a 30 exercícios.');
        }
        const resultado = {
            id: exigirId(divisao.id),
            nome: exigirTexto(divisao.nome, 'nome da divisão', 60),
            exercicios: divisao.exercicios.map(validarExercicio),
        };
        const ids = [resultado.id].concat(resultado.exercicios.map(function obterId(item) {
            return item.id;
        }));
        ids.map(function conferirId(id) {
            if (identificadores.has(id)) {
                throw erroOperacao(422, 'Cada divisão e exercício precisa de um identificador próprio.');
            }
            identificadores.add(id);
            return id;
        });
        return resultado;
    });
    return {
        nome: exigirTexto(entrada.nome, 'nome da rotina'),
        divisoes: divisoes,
    };
}
