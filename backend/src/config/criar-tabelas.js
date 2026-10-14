// Crio as tabelas ausentes a partir dos modelos, preservando as estruturas existentes.
// Sou chamado por servidor.js antes de abrir a API. Espero cada sync na ordem dos vínculos entre tabelas; assim, uma
// conta não é preparada antes do aluno ao qual ela pertence.

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

// Preparo as tabelas antes de aceitar pedidos; uso await para respeitar a ordem dos vínculos.
export async function criarTabelas() {
    // Começo por Pessoa porque a tabela de alunos vai apontar para um registro dela.
    await Pessoa.sync();

    // Uso sync para criar a tabela se ela ainda não existir. Não passo force nem alter, porque eu não quero apagar
    // dados nem mexer nas colunas já existentes.
    await Aluno.sync();
    // Preparo as contas depois dos alunos, pois cada acesso precisa apontar para um cadastro existente.
    await Conta.sync();
    // Organizo as sessões depois das contas para respeitar o vínculo de cada login com seu dono.
    await Sessao.sync();
    // Espero uma tabela por vez para saber em qual etapa a preparação parou se acontecer algum erro.
    await Lembrete.sync();
    // Deixo a tabela de planos pronta para as operações de catálogo previstas no backend.
    await Plano.sync();
    // Acrescento a estrutura das modalidades usando os campos descritos no próprio modelo.
    await Modalidade.sync();
    // Reservo por último a tabela de recibos, que permite reconhecer uma gravação já confirmada num reenvio.
    await OperacaoRecebida.sync();
    await Rotina.sync();
    await Treino.sync();
    await Funcionario.sync();
    await Chegada.sync();
    await RascunhoFicha.sync();
} // Termino criarTabelas e devolvo o controle a quem chamou.
