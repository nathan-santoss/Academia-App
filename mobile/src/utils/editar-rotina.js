import { randomUUID } from 'expo-crypto';

export function novaDivisao() {
    return {
        id: randomUUID(),
        nome: '',
        exercicios: [],
    };
}

export function novoExercicio(catalogo = null) {
    const exercicio = {
        id: randomUUID(),
        nome: '',
        equipamento: '',
        referenciaCarga: 'total em kg',
        tipo: 'repeticoes',
        series: '',
        meta: '',
        carga: '',
        descanso: '',
        observacoes: '',
    };
    if (catalogo) {
        return Object.assign({}, exercicio, {
            exercicioCatalogoId: catalogo.id,
            nome: catalogo.nome,
            equipamento: catalogo.equipamento,
            tipo: catalogo.tipo,
        });
    }
    return exercicio;
}

export function posicionarItem(lista, indice, destino) {
    if (!Number.isInteger(indice) || !Number.isInteger(destino) || indice < 0 || indice >= lista.length || destino < 0 || destino >= lista.length) {
        return lista;
    }
    const copia = lista.slice();
    const removidos = copia.splice(indice, 1);
    copia.splice(destino, 0, removidos[0]);
    return copia;
}

export function prepararRotina(formulario) {
    return Object.assign({}, formulario, {
        divisoes: formulario.divisoes.map(function prepararDivisao(divisao) {
            return Object.assign({}, divisao, {
                exercicios: divisao.exercicios.map(function prepararExercicio(exercicio) {
                    let carga = null;
                    if (String(exercicio.carga).trim() !== '' && exercicio.carga !== null) {
                        carga = Number(String(exercicio.carga).replace(',', '.'));
                    }
                    return Object.assign({}, exercicio, {
                        series: Number(exercicio.series),
                        meta: Number(exercicio.meta),
                        carga: carga,
                        descanso: Number(exercicio.descanso),
                    });
                }),
            });
        }),
    });
}
