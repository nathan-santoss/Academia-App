// Crio as tabelas ausentes a partir dos modelos, preservando as estruturas existentes.
import Pessoa from '../models/pessoa.js';
import Aluno from '../models/aluno.js';
import Lembrete from '../models/lembrete.js';
import Plano from '../models/plano.js';
import Modalidade from '../models/modalidade.js';
import OperacaoRecebida from '../models/operacao-recebida.js';

export async function criarTabelas() {
    // Crio primeiro a tabela de pessoas, pois cada aluno precisa de uma pessoa cadastrada.
    await Pessoa.sync();

    // Preparo a tabela de alunos com o vínculo e a sequência definidos no modelo.
    // Preservo as tabelas existentes: uso sync sem as opções force ou alter.
    await Aluno.sync();
    await Lembrete.sync();
    await Plano.sync();
    await Modalidade.sync();
    await OperacaoRecebida.sync();
}
