export function resumirEvolucao(treinos) {
    const exercicios = {};
    let completos = 0;
    let parciais = 0;
    treinos.filter(function oficial(treino) {
        return treino.referencia.modo !== 'demonstracao';
    }).map(function resumir(treino) {
        if (treino.estado === 'completo') {
            completos += 1;
        } else {
            parciais += 1;
        }
        treino.series.map(function registrar(serie) {
            const referencia = treino.referencia.divisao.exercicios.find(function encontrar(item) {
                return item.id === serie.exercicioId;
            });
            if (!referencia) {
                return serie;
            }
            // Separo equipamento, tipo e referência de carga para não misturar execuções incompatíveis.
            const chave = JSON.stringify([
                referencia.exercicioCatalogoId || referencia.nome,
                referencia.equipamento,
                referencia.tipo,
                referencia.referenciaCarga,
            ]);
            if (!exercicios[chave]) {
                exercicios[chave] = {
                    nome: referencia.nome,
                    equipamento: referencia.equipamento,
                    tipo: referencia.tipo,
                    referenciaCarga: referencia.referenciaCarga,
                    registros: [],
                };
            }
            exercicios[chave].registros.push({
                treinoId: treino.id,
                dia: treino.encerradoEm,
                numero: serie.numero,
                carga: serie.carga,
                realizado: serie.realizado,
                estado: treino.estado,
            });
            return serie;
        });
        return treino;
    });
    return {
        completos: completos,
        parciais: parciais,
        exercicios: Object.values(exercicios),
    };
}
