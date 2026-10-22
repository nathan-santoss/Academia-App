import * as repositorio from '../repositories/funcionario-repositorio.js';
import { exigirAlgumPapel } from './equipe-servico.js';
import { executarTransacao, bloquearOperacao } from '../repositories/treino-repositorio.js';
import { registrarAuditoria } from './auditoria-servico.js';
import { exigirId } from '../utils/validar-id.js';
import { exigirTexto } from '../utils/validar-rotina.js';
import { obterPagina } from '../utils/validar-pagina.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function listar(acesso, pagina) {
    await exigirAlgumPapel(acesso, ['gestao', 'administrador']);
    return repositorio.listar(obterPagina(pagina));
}

export async function buscarContas(acesso, busca) {
    await exigirAlgumPapel(acesso, ['gestao', 'administrador']);
    const texto = exigirTexto(busca, 'nome ou matrícula', 100);
    if (texto.length < 2) {
        throw erroOperacao(422, 'Digite pelo menos dois caracteres.');
    }
    return repositorio.buscarContas(texto);
}

export async function salvar(acesso, contaId, entrada) {
    exigirId(contaId);
    const papeisAtor = await exigirAlgumPapel(acesso, ['gestao', 'administrador']);
    if (!entrada || typeof entrada.ativo !== 'boolean' || !Array.isArray(entrada.papeis) || entrada.papeis.length === 0 ||
        !entrada.papeis.every(function permitido(papel) {
            return ['recepcao', 'instrutor', 'gestao', 'administrador'].includes(papel);
        })) {
        throw erroOperacao(422, 'Informe estado e papéis válidos.');
    }
    const motivo = exigirTexto(entrada.motivo, 'motivo e validação de identidade', 500);
    if (contaId === acesso.contaId) {
        throw erroOperacao(403, 'Não altere seu próprio vínculo funcional.');
    }
    return executarTransacao(async function gravar(transacao) {
        await bloquearOperacao(contaId, transacao);
        const conta = await repositorio.buscarConta(contaId, transacao);
        if (!conta || !conta.ativo) {
            throw erroOperacao(404, 'Conta ativa não encontrada. A entrega de credencial inicial permanece pendente.');
        }
        const anterior = await repositorio.buscar(contaId, transacao);
        const superior = entrada.papeis.some(function elevado(papel) {
            return ['gestao', 'administrador'].includes(papel);
        });
        let superiorAnterior = false;
        if (anterior) {
            superiorAnterior = anterior.papeis.some(function elevado(papel) {
                return ['gestao', 'administrador'].includes(papel);
            });
        }
        if (!papeisAtor.includes('administrador') && (superior || superiorAnterior)) {
            throw erroOperacao(403, 'Somente o Administrador do Sistema administra papéis superiores.');
        }
        const dados = {
            contaId: contaId,
            ativo: entrada.ativo,
            papeis: Array.from(new Set(entrada.papeis)),
        };
        await repositorio.salvar(dados, transacao);
        if (!dados.ativo) {
            await repositorio.revogarBeneficiosFuncionais(conta.alunoId, transacao);
        }
        await registrarAuditoria(acesso, conta.alunoId, 'vinculo_funcional_alterado', contaId, {
            motivo: motivo,
            anterior: anterior,
            atual: dados,
        }, transacao);
        return repositorio.buscar(contaId, transacao);
    });
}
