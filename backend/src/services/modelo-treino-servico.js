import * as repositorio from '../repositories/modelo-treino-repositorio.js';
import { exigirPapel, exigirAlgumPapel } from './equipe-servico.js';
import { executarTransacao, bloquearOperacao } from '../repositories/treino-repositorio.js';
import { conferirReferencias } from './exercicio-servico.js';
import { validarRotina, exigirNumero } from '../utils/validar-rotina.js';
import { exigirId } from '../utils/validar-id.js';
import { obterPagina } from '../utils/validar-pagina.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function listar(acesso, pagina) {
    await exigirAlgumPapel(acesso, ['instrutor', 'administrador']);
    return repositorio.listar(acesso.contaId, obterPagina(pagina));
}

export async function salvar(acesso, id, entrada) {
    exigirId(id);
    if (!entrada || typeof entrada.oficial !== 'boolean' || typeof entrada.ativo !== 'boolean') {
        throw erroOperacao(422, 'Informe o tipo e a disponibilidade do modelo.');
    }
    if (entrada.oficial) {
        await exigirPapel(acesso, 'administrador');
    } else {
        await exigirPapel(acesso, 'instrutor');
    }
    const conteudo = validarRotina(entrada.conteudo);
    const revisao = exigirNumero(entrada.revisao, 'revisão', 0, 2147483646);
    return executarTransacao(async function gravar(transacao) {
        await bloquearOperacao(id, transacao);
        const atual = await repositorio.buscar(id, transacao);
        if (atual && (atual.autorContaId !== acesso.contaId || atual.oficial !== entrada.oficial)) {
            throw erroOperacao(403, 'Este modelo pertence a outro autor ou catálogo.');
        }
        if (atual && atual.revisao !== revisao || !atual && revisao !== 0) {
            throw erroOperacao(409, 'O modelo mudou. Consulte a revisão atual.');
        }
        await conferirReferencias(conteudo, transacao);
        const dados = {
            conteudo: conteudo,
            revisao: revisao + 1,
            ativo: entrada.ativo,
        };
        if (atual) {
            return repositorio.atualizar(atual, dados, transacao);
        }
        return repositorio.criar(Object.assign({}, dados, {
            id: id,
            autorContaId: acesso.contaId,
            oficial: entrada.oficial,
        }), transacao);
    });
}
