// Crio as tabelas ausentes a partir dos modelos, preservando as estruturas existentes.
import Pessoa from '../models/pessoa.js';
import Aluno from '../models/aluno.js';
import Lembrete from '../models/lembrete.js';
import Plano from '../models/plano.js';
import Modalidade from '../models/modalidade.js';
import OperacaoRecebida from '../models/operacao-recebida.js';
import Conta from '../models/conta.js';
import Sessao from '../models/sessao.js';

export async function criarTabelas() {
    // Começo por Pessoa porque a tabela de alunos vai apontar para um registro dela.
    await Pessoa.sync();

    // Uso sync para criar a tabela se ela ainda não existir.
    // Não passo force nem alter, porque eu não quero apagar dados nem mexer nas colunas já existentes.
    await Aluno.sync();
    // Preparo as contas depois dos alunos, pois cada acesso pertence a um cadastro.
    await Conta.sync();
    await Sessao.sync();
    // Espero uma tabela por vez para saber em qual etapa a preparação parou se acontecer algum erro.
    await Lembrete.sync();
    await Plano.sync();
    await Modalidade.sync();
    await OperacaoRecebida.sync();
}
