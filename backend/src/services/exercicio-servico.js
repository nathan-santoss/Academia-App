import * as repositorio from '../repositories/exercicio-repositorio.js';
import { validarConsultaExercicios } from '../utils/validar-exercicio.js';
import { exigirId } from '../utils/validar-id.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function listar(consulta) {
    const filtros = validarConsultaExercicios(consulta);
    const resultado = await repositorio.listar(filtros);
    return {
        dados: resultado.rows,
        total: resultado.count,
        pagina: filtros.pagina,
        limite: filtros.limite,
    };
}

export async function consultar(id) {
    const exercicio = await repositorio.buscarPorId(exigirId(id));
    if (!exercicio || !exercicio.ativo) {
        throw erroOperacao(404, 'Exercício ativo não encontrado.');
    }
    return exercicio;
}

export async function conferirReferencias(conteudo, transacao) {
    const ids = conteudo.divisoes.flatMap(function exercicios(divisao) {
        return divisao.exercicios.map(function referencia(exercicio) {
            return exercicio.exercicioCatalogoId;
        }).filter(Boolean);
    });
    if (ids.length === 0) {
        return;
    }
    const encontrados = await repositorio.buscarPorIds(ids, transacao);
    if (ids.some(function ausente(id) {
        return !encontrados.some(function mesmo(item) {
            return item.id === id;
        });
    })) {
        throw erroOperacao(422, 'Um exercício selecionado não existe no catálogo. Consulte a lista novamente.');
    }
}
