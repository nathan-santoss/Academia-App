import * as repositorio from '../repositories/exercicio-repositorio.js';
import { executarTransacao, bloquearOperacao } from '../repositories/treino-repositorio.js';
import { exigirPapel } from './equipe-servico.js';
import { registrarAuditoria } from './auditoria-servico.js';
import { validarCadastroExercicio } from '../utils/validar-cadastro-exercicio.js';
import { exigirId } from '../utils/validar-id.js';
import { erroOperacao } from '../utils/erro-operacao.js';

export async function salvar(acesso, id, entrada) {
    exigirId(id);
    const dados = validarCadastroExercicio(entrada);
    if (dados.origem === 'oficial') {
        await exigirPapel(acesso, 'administrador');
    } else {
        await exigirPapel(acesso, 'instrutor');
    }
    return executarTransacao(async function gravar(transacao) {
        await bloquearOperacao(id, transacao);
        const atual = await repositorio.buscarPorId(id, transacao);
        let revisao = 0;
        if (atual && atual.detalhes) {
            revisao = atual.detalhes.revisao;
            if (atual.detalhes.origem !== dados.origem) {
                throw erroOperacao(403, 'Não altere a origem de um exercício existente.');
            }
        } else if (atual) {
            await exigirPapel(acesso, 'administrador');
        }
        if (revisao !== dados.revisao) {
            throw erroOperacao(409, 'O exercício mudou. Consulte a revisão atual.');
        }
        await repositorio.salvarExercicio(id, {
            nome: dados.nome,
            grupoMuscular: dados.grupoMuscular,
            equipamento: dados.equipamento,
            tipo: dados.tipo,
            descricao: dados.descricao,
            ativo: dados.ativo,
        }, atual, transacao);
        await repositorio.salvarDetalhes({
            exercicioId: id,
            autorContaId: acesso.contaId,
            origem: dados.origem,
            termosBusca: dados.termosBusca,
            imagemUrl: dados.imagemUrl,
            videoUrl: dados.videoUrl,
            revisao: revisao + 1,
        }, transacao);
        await registrarAuditoria(acesso, null, 'exercicio_atualizado', id, dados, transacao);
        return repositorio.buscarPorId(id, transacao);
    });
}
