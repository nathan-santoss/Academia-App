import Exercicio from '../models/exercicio.js';
import Pessoa from '../models/pessoa.js';
import Aluno from '../models/aluno.js';
import Lembrete from '../models/lembrete.js';
import Plano from '../models/plano.js';
import Modalidade from '../models/modalidade.js';
import OperacaoRecebida from '../models/operacao-recebida.js';
import Conta from '../models/conta.js';
import Sessao from '../models/sessao.js';
import Rotina from '../models/rotina.js';
import Treino from '../models/treino.js';
import Funcionario from '../models/funcionario.js';
import Chegada from '../models/chegada.js';
import RascunhoFicha from '../models/rascunho-ficha.js';

export async function criarTabelas() {

    await Pessoa.sync();

    await Aluno.sync();

    await Conta.sync();

    await Sessao.sync();

    await Lembrete.sync();

    await Plano.sync();

    await Modalidade.sync();

    await OperacaoRecebida.sync();
    await Rotina.sync();
    await Treino.sync();
    await Funcionario.sync();
    await Chegada.sync();
    await RascunhoFicha.sync();
    await Exercicio.sync();
}
