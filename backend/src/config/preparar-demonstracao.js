import { exerciciosIniciais } from './exercicios-iniciais.js';
import { prepararExercicios } from '../repositories/exercicio-repositorio.js';
import { provisionarContas } from '../services/provisionamento-servico.js';

export async function prepararDemonstracao() {
    if (process.env.DEMO_CATALOGO_HABILITADO === 'true') {
        await prepararExercicios(exerciciosIniciais);
    }
    await provisionarContas();
}
