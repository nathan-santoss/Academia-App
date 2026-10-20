import { listarFila } from '../repositories/equipe-repositorio.js';
import { exigirPapel } from './equipe-servico.js';
import { obterPagina } from '../utils/validar-pagina.js';
import { diaAcademia } from '../utils/dia-academia.js';

export async function consultar(acesso, pagina) {
    await exigirPapel(acesso, 'recepcao');
    return listarFila(diaAcademia(), obterPagina(pagina));
}
