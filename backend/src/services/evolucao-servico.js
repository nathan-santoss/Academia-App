import * as repositorio from '../repositories/evolucao-repositorio.js';
import { exigirPapel } from './equipe-servico.js';
import { exigirDia, somarDias } from '../utils/validar-financeiro.js';
import { exigirId } from '../utils/validar-id.js';
import { erroOperacao } from '../utils/erro-operacao.js';
import { resumirEvolucao } from '../utils/resumir-evolucao.js';

export async function consultar(acesso, alunoId, consulta) {
    exigirId(alunoId);
    if (acesso.alunoId !== alunoId) {
        await exigirPapel(acesso, 'instrutor');
    }
    const inicio = exigirDia(consulta.inicio);
    const fim = exigirDia(consulta.fim);
    if (fim < inicio || fim > somarDias(inicio, 366)) {
        throw erroOperacao(422, 'Consulte um intervalo de até 366 dias.');
    }
    const treinos = await repositorio.listar(alunoId, inicio, somarDias(fim, 1));
    if (treinos.length === 1000) {
        throw erroOperacao(422, 'Reduza o intervalo para consultar todos os registros sem cortes.');
    }
    return resumirEvolucao(treinos);
}
