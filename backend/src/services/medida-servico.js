import * as repositorio from '../repositories/medida-repositorio.js';
import { exigirPapel } from './equipe-servico.js';
import { executarOperacao } from './operacao-servico.js';
import { registrarAuditoria } from './auditoria-servico.js';
import { validarMedida } from '../utils/validar-medida.js';
import { exigirNumero, exigirTexto } from '../utils/validar-rotina.js';
import { exigirId } from '../utils/validar-id.js';
import { obterPagina } from '../utils/validar-pagina.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function consultarPrivacidade(acesso) {
    const atual = await repositorio.buscarPrivacidade(acesso.alunoId);
    if (atual) {
        return atual;
    }
    return {
        compartilharMedidas: false,
    };
}

export async function listar(acesso, alunoId, pagina) {
    exigirId(alunoId);
    if (acesso.alunoId !== alunoId) {
        await exigirPapel(acesso, 'instrutor');
        const permissao = await repositorio.buscarPrivacidade(alunoId);
        if (!permissao || !permissao.compartilharMedidas) {
            throw erroOperacao(403, 'O aluno não compartilhou suas medidas.');
        }
    }
    return repositorio.listar(alunoId, obterPagina(pagina));
}

export async function salvarPrivacidade(acesso, entrada, operacaoId) {
    if (!entrada || typeof entrada.compartilharMedidas !== 'boolean') {
        throw erroOperacao(422, 'Informe sua escolha de compartilhamento.');
    }
    const dados = {
        alunoId: acesso.alunoId,
        compartilharMedidas: entrada.compartilharMedidas,
    };
    return executarOperacao(acesso, acesso.alunoId, operacaoId, 'privacidade', dados, async function salvar(transacao) {
        await repositorio.salvarPrivacidade(dados, transacao);
        await registrarAuditoria(acesso, acesso.alunoId, 'privacidade_alterada', acesso.alunoId, dados, transacao);
        return dados;
    });
}

export async function registrar(acesso, entrada, operacaoId) {
    const dados = validarMedida(entrada);
    return executarOperacao(acesso, acesso.alunoId, operacaoId, 'registrar_medida', dados, async function salvar(transacao) {
        return repositorio.criar(Object.assign({}, dados, {
            alunoId: acesso.alunoId,
        }), transacao);
    });
}

export async function corrigir(acesso, id, entrada, operacaoId) {
    exigirId(id);
    const dados = validarMedida(entrada);
    const revisao = exigirNumero(entrada.revisao, 'revisão', 1, 2147483646);
    const motivo = exigirTexto(entrada.motivo, 'motivo da correção', 500);
    return executarOperacao(acesso, acesso.alunoId, operacaoId, 'corrigir_medida', {
        id: id,
        dados: dados,
        revisao: revisao,
        motivo: motivo,
    }, async function salvar(transacao) {
        const medida = await repositorio.buscar(id, acesso.alunoId, transacao);
        if (!medida) {
            throw erroOperacao(404, 'Medida não encontrada.');
        }
        if (medida.revisao !== revisao) {
            throw erroOperacao(409, 'A medida mudou. Consulte antes de corrigir.');
        }
        if (medida.tipo !== dados.tipo) {
            throw erroOperacao(422, 'Uma correção não pode mudar o tipo da medida.');
        }
        const anterior = medida.toJSON();
        await repositorio.corrigir(medida, Object.assign({}, dados, {
            revisao: revisao + 1,
        }), transacao);
        await registrarAuditoria(acesso, acesso.alunoId, 'medida_corrigida', id, {
            anterior: anterior,
            atual: medida.toJSON(),
            motivo: motivo,
        }, transacao);
        return medida;
    });
}
