import { randomUUID } from 'expo-crypto';
import { prepararConteudo } from './validar-rotina';
import { completarNomesRotina, erroRotina } from './formulario-rotina';

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

export { posicionarItem } from './organizar-rotina';

export function prepararRotina(formulario) {
    const aviso = erroRotina(formulario);
    if (aviso) { throw new Error(aviso); }
    // Uno os nomes sugeridos ao contrato limpo usado pelas fichas e pelos modelos.
    const conteudo = prepararConteudo(completarNomesRotina(formulario));
    if (formulario.versaoAnterior !== undefined) {
        return Object.assign({}, conteudo, {
            versaoAnterior: formulario.versaoAnterior,
        });
    }
    return conteudo;
}
