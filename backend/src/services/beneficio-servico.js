import * as repositorio from '../repositories/financeiro-repositorio.js';
import { exigirPapel } from './equipe-servico.js';
import { executarOperacao } from './operacao-servico.js';
import { registrarAuditoria } from './auditoria-servico.js';
import { notificarAluno } from './notificacao-servico.js';
import { exigirDia } from '../utils/validar-financeiro.js';
import { exigirTexto } from '../utils/validar-rotina.js';
import { exigirId } from '../utils/validar-id.js';
import { obterPagina } from '../utils/validar-pagina.js';
import { apresentarBeneficio } from '../utils/apresentar-beneficio.js';
import { diaAcademia } from '../utils/dia-academia.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function listar(acesso, alunoId, pagina) {
    exigirId(alunoId);
    if (acesso.alunoId !== alunoId) {
        await exigirPapel(acesso, 'gestao');
    }
    const registros = await repositorio.listarHistoricoBeneficios(alunoId, obterPagina(pagina));
    const assinatura = await repositorio.buscarAssinatura(alunoId);
    const funcionario = await repositorio.funcionarioDoAluno(alunoId);
    const dia = diaAcademia();
    return registros.map(function apresentar(registro) {
        return apresentarBeneficio(registro, assinatura, funcionario, dia);
    });
}

export async function conceder(acesso, alunoId, entrada, operacaoId) {
    await exigirPapel(acesso, 'gestao');
    if (!entrada || !['funcional', 'cortesia'].includes(entrada.origem)) {
        throw erroOperacao(422, 'Escolha benefício funcional ou cortesia.');
    }
    const dados = {
        origem: entrada.origem,
        inicio: exigirDia(entrada.inicio),
        fim: exigirDia(entrada.fim),
        motivo: exigirTexto(entrada.motivo, 'motivo', 500),
    };
    if (dados.fim < dados.inicio || dados.inicio < diaAcademia()) {
        throw erroOperacao(422, 'A vigência deve começar hoje ou no futuro e terminar após o início.');
    }
    return executarOperacao(acesso, alunoId, operacaoId, 'conceder_beneficio', dados, async function gravar(transacao) {
        const assinatura = await repositorio.buscarAssinatura(alunoId, transacao);
        if (assinatura && assinatura.vencimento > dados.inicio) {
            dados.inicio = assinatura.vencimento;
        }
        if (dados.inicio > dados.fim) {
            throw erroOperacao(422, 'O benefício precisa ter vigência após o fim do período pago.');
        }
        if (dados.origem === 'funcional' && !await repositorio.funcionarioDoAluno(alunoId, transacao)) {
            throw erroOperacao(422, 'Benefício funcional exige vínculo ativo.');
        }
        const existentes = await repositorio.listarBeneficios(alunoId, transacao);
        if (existentes.some(function sobrepoe(item) {
            return item.inicio <= dados.fim && item.fim >= dados.inicio;
        })) {
            throw erroOperacao(409, 'Já existe benefício ou cortesia neste período.');
        }
        const beneficio = await repositorio.criarBeneficio(Object.assign({}, dados, {
            alunoId: alunoId,
            autorContaId: acesso.contaId,
        }), transacao);
        await registrarAuditoria(acesso, alunoId, 'beneficio_concedido', beneficio.id, dados, transacao);
        await notificarAluno(alunoId, 'beneficio:' + beneficio.id, 'Uma cobertura gratuita foi concedida. Consulte a vigência.', '/financeiro/situacao', transacao);
        return beneficio;
    });
}

export async function revogar(acesso, alunoId, id, entrada, operacaoId) {
    await exigirPapel(acesso, 'gestao');
    exigirId(id);
    const motivo = exigirTexto(entrada && entrada.motivo, 'motivo', 500);
    return executarOperacao(acesso, alunoId, operacaoId, 'revogar_beneficio', {
        id: id,
        motivo: motivo,
    }, async function encerrar(transacao) {
        const beneficio = await repositorio.buscarBeneficio(id, alunoId, transacao);
        if (!beneficio) {
            throw erroOperacao(404, 'Benefício não encontrado.');
        }
        if (!beneficio.revogadoEm) {
            await repositorio.revogarBeneficio(beneficio, transacao);
            await registrarAuditoria(acesso, alunoId, 'beneficio_revogado', id, {
                motivo: motivo,
            }, transacao);
            await notificarAluno(alunoId, 'beneficio_revogado:' + id, 'Uma cobertura gratuita foi encerrada. Consulte sua situação atual.', '/financeiro/situacao', transacao);
        }
        return beneficio;
    });
}
