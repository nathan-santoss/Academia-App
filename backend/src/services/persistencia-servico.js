// Coordeno Neon, cache e fila, mantendo as operações em ordem neste processo do backend.
import { createHash } from 'node:crypto';
import { UniqueConstraintError } from 'sequelize';
import banco from '../config/banco.js';
import { criarTabelas } from '../config/criar-tabelas.js';
import RegistroCache from '../models/registro-cache.js';
import OperacaoPendente from '../models/operacao-pendente.js';
import { salvarCache, lerCache, substituirCache, confirmarOperacao } from '../repositories/cache-repositorio.js';
import { executarOperacaoOnline, consultarCategoriaOnline } from '../repositories/operacao-online.js';
import { falhaDeConexao } from '../utils/falha-conexao.js';
import { erroOperacao } from '../utils/erro-operacao.js';

let anterior = Promise.resolve();
let online = false;
let ultimaSincronizacao = null;
let falhaSincronizacao = '';

function emOrdem(tarefa) {
    // Evito que a atualização do cache apague uma gravação que chegou durante a sincronização.
    const atual = anterior.then(tarefa, tarefa);
    anterior = atual.catch(function permitirProximaTarefa() {});
    return atual;
}

async function enviarPendentes() {
    const pendentes = await OperacaoPendente.findAll({
        order: [['createdAt', 'ASC'], ['id', 'ASC']],
    });
    let indice = 0;

    while (indice < pendentes.length) {
        const operacao = pendentes[indice];

        if (!operacao.conflito) {
            try {
                const resultado = await executarOperacaoOnline(operacao);
                await confirmarOperacao(operacao, resultado);
            } catch (falha) {
                if (falhaDeConexao(falha)) {
                    throw falha;
                }

                let mensagem = 'A operação precisa ser revisada antes de sincronizar.';

                if (falha instanceof UniqueConstraintError) {
                    mensagem = 'Existe um cadastro conflitante no Neon. Nenhum dado online foi substituído.';
                } else if (falha.statusOperacao) {
                    mensagem = falha.message;
                } else {
                    // Preservo a fila em falhas de estrutura, sem escondê-las como queda de conexão.
                    throw falha;
                }

                await operacao.update({
                    conflito: mensagem,
                });
            }
        }

        indice += 1;
    }
}

async function atualizarTudo() {
    try {
        await banco.authenticate();
        await criarTabelas();
        online = true;
        await enviarPendentes();

        // Atualizo uma categoria por vez; cópias anteriores sobrevivem se uma consulta falhar.
        const categorias = ['aluno', 'lembrete', 'plano', 'modalidade'];
        let indice = 0;

        while (indice < categorias.length) {
            const categoria = categorias[indice];
            const dados = await consultarCategoriaOnline(categoria);
            await substituirCache(categoria, dados);
            indice += 1;
        }

        ultimaSincronizacao = new Date().toISOString();
        await salvarCache('sistema', {
            id: 'sincronizacao',
            horario: ultimaSincronizacao,
        }, false);
        falhaSincronizacao = '';
    } catch (falha) {
        if (!falhaDeConexao(falha)) {
            falhaSincronizacao = 'Não foi possível sincronizar. Confira a configuração e a estrutura do banco.';
            throw falha;
        }

        online = false;
        falhaSincronizacao = 'Neon indisponível. Consulto a última cópia salva no backend.';
    }
}

export async function iniciarPersistencia() {
    await prepararPastaLocal();
    await RegistroCache.sync();
    await OperacaoPendente.sync();
    const metadados = await RegistroCache.findByPk('sistema:sincronizacao');

    if (metadados) {
        ultimaSincronizacao = metadados.dados.horario;
    }

    await emOrdem(atualizarTudo);
}

export function sincronizar() {
    return emOrdem(atualizarTudo);
}

export async function estadoPersistencia() {
    return {
        online: online,
        ultimaSincronizacao: ultimaSincronizacao,
        pendentes: await OperacaoPendente.count(),
        mensagem: falhaSincronizacao,
    };
}

export function consultarRegistros(categoria) {
    return emOrdem(async function consultar() {
        if (online) {
            try {
                const dados = await consultarCategoriaOnline(categoria);
                await substituirCache(categoria, dados);
            } catch (falha) {
                if (!falhaDeConexao(falha)) {
                    throw falha;
                }

                online = false;
            }
        }

        // Identifico a origem para a interface não apresentar uma cópia como consulta atual ao Neon.
        return {
            dados: await lerCache(categoria),
            persistencia: await estadoPersistencia(),
        };
    });
}

export function registrarOperacao(id, tipo, entrada, previa) {
    return emOrdem(async function registrar() {
        const resumo = createHash('sha256').update(JSON.stringify({
            tipo: tipo,
            entrada: entrada,
        })).digest('hex');
        let operacao = await OperacaoPendente.findByPk(id);

        if (operacao && operacao.conflito) {
            throw erroOperacao(409, operacao.conflito);
        }

        if (operacao && operacao.resumo !== resumo) {
            throw erroOperacao(409, 'Use uma nova operação para enviar dados diferentes.');
        }

        if (!operacao) {
            if (entrada.categoria === 'aluno') {
                // Evito repetir CPFs já conhecidos na cópia, sem substituir a restrição do Neon.
                const alunos = await lerCache('aluno');
                const duplicado = alunos.some(function conferir(aluno) {
                    return aluno.cpf === entrada.dados.cpf && aluno.id !== entrada.id;
                });

                if (duplicado) {
                    throw erroOperacao(409, 'CPF já cadastrado. A vinculação exige validação de identidade.');
                }
            }
        }

        if (online) {
            try {
                const resultado = await executarOperacaoOnline(operacao);
                await confirmarOperacao(operacao, resultado);
                return {
                    dados: resultado,
                    pendente: false,
                };
            } catch (falha) {
                if (!falhaDeConexao(falha)) {
                    let mensagem = falha.message;

                    if (falha instanceof UniqueConstraintError) {
                        mensagem = 'Cadastro conflitante. A vinculação de CPF exige validação de identidade.';
                    } else if (!falha.statusOperacao) {
                        throw falha;
                    }

                    await operacao.update({
                        conflito: mensagem,
                    });
                    throw erroOperacao(409, mensagem);
                }

                online = false;
            }
        }

        return {
            dados: previa,
            pendente: true,
            mensagem: 'Registro guardado no backend e aguardando confirmação no Neon.',
        };
    });
}

export async function listarPendencias() {
    const operacoes = await OperacaoPendente.findAll({
        order: [['createdAt', 'ASC']],
    });
    return operacoes.map(function apresentar(operacao) {
        return {
            id: operacao.id,
            categoria: operacao.entrada.categoria,
            criadoEm: operacao.createdAt,
            conflito: operacao.conflito,
        };
    });
}
