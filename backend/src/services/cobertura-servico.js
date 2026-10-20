import * as repositorio from '../repositories/financeiro-repositorio.js';
import { estadoAssinatura } from '../utils/validar-financeiro.js';
import { diaAcademia } from '../utils/dia-academia.js';

export async function consultarCobertura(alunoId, transacao) {
    const dia = diaAcademia();
    const assinatura = await repositorio.buscarAssinatura(alunoId, transacao);
    const estado = estadoAssinatura(assinatura, dia);
    if (estado === 'vigente') {
        return {
            permitida: true,
            estado: estado,
            assinatura: assinatura,
            beneficio: null,
        };
    }
    const beneficios = await repositorio.listarBeneficios(alunoId, transacao);
    const funcionario = await repositorio.funcionarioDoAluno(alunoId, transacao);
    const beneficio = beneficios.find(function vigente(item) {
        return item.inicio <= dia && dia <= item.fim && (item.origem === 'cortesia' || Boolean(funcionario));
    });
    if (beneficio) {
        return {
            permitida: true,
            estado: beneficio.origem,
            assinatura: assinatura,
            beneficio: beneficio,
        };
    }
    return {
        permitida: estado === 'tolerancia',
        estado: estado,
        assinatura: assinatura,
        beneficio: null,
    };
}
