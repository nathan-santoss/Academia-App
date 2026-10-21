import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, randomInt } from 'node:crypto';

if (process.env.NODE_ENV !== 'test' || !process.env.DATABASE_URL_TESTE) {
    throw new Error('Execute com NODE_ENV=test e DATABASE_URL_TESTE apontando à base local academia_teste.');
}
process.env.JWT_SEGREDO = randomUUID() + randomUUID();
const { default: app } = await import('../src/aplicacao.js');
const { default: banco } = await import('../src/config/banco.js');
const { criarTabelas } = await import('../src/config/criar-tabelas.js');
const { default: Conta } = await import('../src/models/conta.js');
const { default: Funcionario } = await import('../src/models/funcionario.js');
const { default: Assinatura } = await import('../src/models/assinatura.js');
const { default: Pagamento } = await import('../src/models/pagamento.js');
const { default: Recuperacao } = await import('../src/models/recuperacao.js');
const { resumirCodigo } = await import('../src/utils/validar-recuperacao.js');
const { diaAcademia } = await import('../src/utils/dia-academia.js');
const { somarDias } = await import('../src/utils/validar-financeiro.js');

let servidor;
let endereco;
const pessoas = {};
let planoId;
let pagamentoId;
let rotina;
let treino;
let medida;

function cpfFicticio() {
    const digitos = Array.from({
        length: 9,
    }, function digito() { return randomInt(10); });
    function completar() {
        const soma = digitos.reduce(function somar(total, numero, indice) {
            return total + numero * (digitos.length + 1 - indice);
        }, 0);
        let digito = (soma * 10) % 11;
        if (digito === 10) {
            digito = 0;
        }
        digitos.push(digito);
    }
    completar();
    completar();
    return digitos.join('');
}

async function requisitar(caminho, pessoa, metodo = 'GET', dados = undefined, status = 200, chave = undefined) {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (pessoa) {
        headers.Authorization = 'Bearer ' + pessoa.token;
    }
    if (chave) {
        headers['Idempotency-Key'] = chave;
    }
    const resposta = await fetch(endereco + caminho, {
        method: metodo,
        headers: headers,
        body: JSON.stringify(dados),
    });
    let resultado = null;
    if (resposta.status !== 204) {
        resultado = await resposta.json();
    }
    assert.equal(resposta.status, status, metodo + ' ' + caminho + ': ' + JSON.stringify(resultado));
    return resultado;
}

async function prepararPessoa(papel) {
    const email = randomUUID() + '@example.test';
    const senha = 'Senha-ficticia-2026';
    await requisitar('/acesso/contas', null, 'POST', {
        nome: 'Pessoa fictícia ' + papel,
        email: email,
        senha: senha,
        cpf: cpfFicticio(),
        dataNascimento: '1995-01-10',
        telefone: '11999998888',
    }, 201);
    const sessao = await requisitar('/acesso/entrar', null, 'POST', {
        email: email,
        senha: senha,
    });
    const conta = await Conta.findOne({
        where: {
            email: email,
        },
    });
    const pessoa = {
        token: sessao.token,
        contaId: conta.id,
        alunoId: conta.alunoId,
        email: email,
        senha: senha,
    };
    pessoas[papel] = pessoa;
    if (!['aluno', 'outro'].includes(papel)) {
        await Funcionario.create({
            contaId: conta.id,
            papeis: [papel],
            ativo: true,
        });
    }
}

before(async function preparar() {
    await criarTabelas();
    servidor = app.listen(0, '127.0.0.1');
    await new Promise(function aguardar(resolve) { servidor.once('listening', resolve); });
    endereco = 'http://127.0.0.1:' + servidor.address().port + '/api/v1';
    await prepararPessoa('aluno');
    await prepararPessoa('outro');
    await prepararPessoa('recepcao');
    await prepararPessoa('instrutor');
    await prepararPessoa('gestao');
    await prepararPessoa('administrador');
});

after(async function encerrar() {
    if (servidor) {
        await new Promise(function fechar(resolve) { servidor.close(resolve); });
    }
    await banco.close();
});

test('autenticação, isolamento e JSON inválido', async function conferir() {
    await requisitar('/treinos/rotinas', null, 'GET', undefined, 401);
    await requisitar('/alunos/' + pessoas.outro.alunoId, pessoas.aluno, 'GET', undefined, 403);
    const resposta = await fetch(endereco + '/acesso/entrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: '{',
    });
    assert.equal(resposta.status, 400);
    assert.match((await resposta.json()).mensagem, /JSON/);
});

test('gestão cadastra catálogo; aluno e instrutor não alteram preços', async function conferir() {
    planoId = randomUUID();
    const dados = {
        nome: 'Mensal de teste',
        precoCentavos: 8990,
        periodo: 'diario',
        ativo: true,
    };
    await requisitar('/catalogo/plano/' + planoId, pessoas.aluno, 'PUT', dados, 403, randomUUID());
    await requisitar('/catalogo/plano/' + planoId, pessoas.instrutor, 'PUT', dados, 403, randomUUID());
    await requisitar('/catalogo/plano/' + planoId, pessoas.gestao, 'PUT', dados, 200, randomUUID());
});

test('pagamento pendente não libera chegada; valor parcial é rejeitado', async function conferir() {
    const caminho = '/financeiro/alunos/' + pessoas.aluno.alunoId + '/pagamentos';
    await requisitar(caminho, pessoas.recepcao, 'POST', {
        planoId: planoId,
        valorCentavos: 100,
        metodo: 'pix',
    }, 409, randomUUID());
    const chave = randomUUID();
    const dados = {
        planoId: planoId,
        valorCentavos: 8990,
        metodo: 'pix',
    };
    const primeiro = await requisitar(caminho, pessoas.recepcao, 'POST', dados, 201, chave);
    const repetido = await requisitar(caminho, pessoas.recepcao, 'POST', dados, 201, chave);
    assert.equal(primeiro.id, repetido.id);
    pagamentoId = primeiro.id;
    await requisitar('/equipe/alunos/' + pessoas.aluno.alunoId + '/chegada', pessoas.recepcao, 'POST', undefined, 403);
    assert.equal((await requisitar('/financeiro/situacao', pessoas.aluno)).permitida, false);
});

test('duas confirmações simultâneas criam uma única cobertura', async function conferir() {
    const caminho = '/financeiro/alunos/' + pessoas.aluno.alunoId + '/pagamentos/' + pagamentoId + '/confirmar';
    const respostas = await Promise.all([
        requisitar(caminho, pessoas.recepcao, 'POST', undefined, 200, randomUUID()),
        requisitar(caminho, pessoas.recepcao, 'POST', undefined, 200, randomUUID()),
    ]);
    assert.equal(respostas[0].assinaturaId, respostas[1].assinaturaId);
    assert.equal(await Assinatura.count({
        where: {
            alunoId: pessoas.aluno.alunoId,
        },
    }), 1);
    assert.equal((await requisitar('/financeiro/situacao', pessoas.aluno)).estado, 'vigente');
});

test('chegada presencial funciona sem pedido no celular e sem duplicar', async function conferir() {
    const caminho = '/equipe/alunos/' + pessoas.aluno.alunoId + '/chegada';
    const resultados = await Promise.all([
        requisitar(caminho, pessoas.recepcao, 'POST'),
        requisitar(caminho, pessoas.recepcao, 'POST'),
    ]);
    assert.equal(resultados[0].id, resultados[1].id);
    assert.ok(resultados[0].confirmadaEm);
    assert.equal(resultados[0].autorizadaPor, null);
});

test('instrutor não consulta financeiro e aluno não confirma pagamentos', async function conferir() {
    const caminho = '/financeiro/alunos/' + pessoas.aluno.alunoId;
    await requisitar(caminho + '/situacao', pessoas.instrutor, 'GET', undefined, 403);
    await requisitar(caminho + '/pagamentos/' + pagamentoId + '/confirmar', pessoas.aluno, 'POST', undefined, 403, randomUUID());
});

test('rotina pessoal preserva versão e detecta conflitos', async function conferir() {
    const entrada = {
        nome: 'Rotina teste',
        versaoAnterior: 0,
        ciente: true,
        substituir: true,
        divisoes: [{
            id: randomUUID(),
            nome: 'A',
            exercicios: [{
                id: randomUUID(),
                nome: 'Agachamento teste',
                equipamento: 'Peso corporal',
                referenciaCarga: 'total em kg',
                tipo: 'repeticoes',
                series: 2,
                meta: 10,
                carga: null,
                descanso: 30,
            }],
        }],
    };
    rotina = await requisitar('/treinos/rotinas/pessoal', pessoas.aluno, 'PUT', entrada);
    const repetida = await requisitar('/treinos/rotinas/pessoal', pessoas.aluno, 'PUT', entrada);
    assert.equal(rotina.id, repetida.id);
    entrada.nome = 'Conflito';
    await requisitar('/treinos/rotinas/pessoal', pessoas.aluno, 'PUT', entrada, 409);
});

test('uma sessão ativa, snapshot e isolamento entre alunos', async function conferir() {
    const dados = {
        id: randomUUID(),
        origem: 'pessoal',
        rotinaId: rotina.id,
        divisaoId: rotina.conteudo.divisoes[0].id,
    };
    treino = await requisitar('/treinos', pessoas.aluno, 'POST', dados);
    dados.id = randomUUID();
    await requisitar('/treinos', pessoas.aluno, 'POST', dados, 409);
    await requisitar('/treinos/' + treino.id, pessoas.outro, 'GET', undefined, 404);
});

test('reenvio idempotente e conclusão parcial preservam apenas séries realizadas', async function conferir() {
    const dados = {
        operacaoId: randomUUID(),
        revisao: 0,
        encerrar: true,
        series: [{
            exercicioId: rotina.conteudo.divisoes[0].exercicios[0].id,
            numero: 1,
            carga: 0,
            realizado: 10,
        }],
    };
    const primeiro = await requisitar('/treinos/' + treino.id, pessoas.aluno, 'PUT', dados);
    const repetido = await requisitar('/treinos/' + treino.id, pessoas.aluno, 'PUT', dados);
    assert.equal(primeiro.estado, 'parcial');
    assert.equal(primeiro.series.length, 1);
    assert.deepEqual(primeiro, repetido);
    dados.series[0].realizado = 11;
    await requisitar('/treinos/' + treino.id, pessoas.aluno, 'PUT', dados, 409);
});

test('medidas privadas e consentimento revogável sem acesso da recepção', async function conferir() {
    medida = await requisitar('/medidas', pessoas.aluno, 'POST', {
        tipo: 'peso',
        valor: 75,
        dia: diaAcademia(),
    }, 201, randomUUID());
    const caminho = '/medidas/alunos/' + pessoas.aluno.alunoId;
    await requisitar(caminho, pessoas.instrutor, 'GET', undefined, 403);
    await requisitar('/medidas/privacidade', pessoas.aluno, 'PUT', {
        compartilharMedidas: true,
    }, 200, randomUUID());
    assert.equal((await requisitar(caminho, pessoas.instrutor)).length, 1);
    await requisitar(caminho, pessoas.recepcao, 'GET', undefined, 403);
    await requisitar('/medidas/privacidade', pessoas.aluno, 'PUT', {
        compartilharMedidas: false,
    }, 200, randomUUID());
    await requisitar(caminho, pessoas.instrutor, 'GET', undefined, 403);
});

test('correção de medida exige revisão e não vaza valores na auditoria gerencial', async function conferir() {
    const dados = {
        tipo: 'peso',
        valor: 74,
        dia: diaAcademia(),
        revisao: 1,
        motivo: 'Erro de digitação',
    };
    const corrigida = await requisitar('/medidas/' + medida.id, pessoas.aluno, 'PUT', dados, 200, randomUUID());
    assert.equal(corrigida.revisao, 2);
    await requisitar('/medidas/' + medida.id, pessoas.aluno, 'PUT', dados, 409, randomUUID());
    const auditoria = await requisitar('/auditoria?alunoId=' + pessoas.aluno.alunoId, pessoas.gestao);
    assert.equal(auditoria.some(function privada(item) { return item.acao === 'medida_corrigida'; }), false);
});


test('catálogo local aceita termos de busca e mantém exercícios arquivados no histórico', async function conferir() {
    const id = randomUUID();
    const dados = {
        nome: 'Flexão de teste',
        grupoMuscular: 'Peito',
        equipamento: 'Peso corporal',
        tipo: 'repeticoes',
        ativo: true,
        origem: 'local',
        termosBusca: 'push up testeunico' + id,
        revisao: 0,
    };
    const criado = await requisitar('/exercicios/' + id, pessoas.instrutor, 'PUT', dados);
    assert.equal(criado.detalhes.revisao, 1);
    const busca = await requisitar('/exercicios?busca=testeunico' + id, pessoas.aluno);
    assert.equal(busca.dados[0].id, id);
    dados.origem = 'oficial';
    await requisitar('/exercicios/' + randomUUID(), pessoas.instrutor, 'PUT', dados, 403);
    dados.origem = 'local';
    dados.revisao = 1;
    dados.ativo = false;
    await requisitar('/exercicios/' + id, pessoas.instrutor, 'PUT', dados);
    await requisitar('/exercicios/' + id, pessoas.aluno, 'GET', undefined, 404);
    assert.equal((await requisitar('/exercicios?busca=testeunico' + id, pessoas.aluno)).total, 0);
});

test('modelo privado só aparece ao autor; modelo não prescreve ao aluno', async function conferir() {
    const id = randomUUID();
    await requisitar('/modelos-treino/' + id, pessoas.instrutor, 'PUT', {
        oficial: false,
        ativo: true,
        conteudo: rotina.conteudo,
        revisao: 0,
    });
    const modelos = await requisitar('/modelos-treino', pessoas.instrutor);
    assert.ok(modelos.some(function criado(item) { return item.id === id; }));
    const outros = await requisitar('/modelos-treino', pessoas.administrador);
    assert.equal(outros.some(function privado(item) { return item.id === id; }), false);
    assert.equal((await requisitar('/treinos/rotinas', pessoas.aluno)).recomendada, null);
});

test('publicação concorrente gera uma versão, notificação e restauração explícita', async function conferir() {
    const alunoId = pessoas.aluno.alunoId;
    const caminho = '/equipe/alunos/' + alunoId + '/ficha';
    const rascunho = await requisitar(caminho + '/rascunho', pessoas.instrutor, 'PUT', Object.assign({}, rotina.conteudo, {
        revisao: 0,
        versaoBase: 0,
    }));
    const entrada = {
        confirmarAlunoId: alunoId,
        revisao: rascunho.revisao,
    };
    const publicacoes = await Promise.all([
        requisitar(caminho + '/publicar', pessoas.instrutor, 'POST', entrada),
        requisitar(caminho + '/publicar', pessoas.instrutor, 'POST', entrada),
    ]);
    assert.equal(publicacoes[0].id, publicacoes[1].id);
    const versoes = await requisitar(caminho + '/versoes', pessoas.gestao);
    assert.equal(versoes.length, 1);
    assert.equal((await requisitar('/treinos/rotinas', pessoas.aluno)).pessoal.id, rotina.id);
    const restaurado = await requisitar(caminho + '/versoes/' + publicacoes[0].id + '/restaurar', pessoas.instrutor, 'POST', {
        revisao: rascunho.revisao,
        versaoBase: 1,
    });
    assert.equal(restaurado.publicadaId, null);
    await requisitar(caminho + '/publicar', pessoas.instrutor, 'POST', {
        confirmarAlunoId: alunoId,
        revisao: restaurado.revisao,
    });
    assert.equal((await requisitar(caminho + '/versoes', pessoas.gestao)).length, 2);
});

test('evolução usa execução confirmada; correção recalcula sem alterar a prescrição', async function conferir() {
    const consulta = '?inicio=' + diaAcademia() + '&fim=' + diaAcademia();
    const antes = await requisitar('/treinos/evolucao' + consulta, pessoas.aluno);
    assert.equal(antes.parciais, 1);
    assert.equal(antes.exercicios[0].registros[0].realizado, 10);
    await requisitar('/treinos/' + treino.id + '/correcao', pessoas.aluno, 'PUT', {
        revisao: 1,
        motivo: 'Correção de digitação',
        series: [{
            exercicioId: rotina.conteudo.divisoes[0].exercicios[0].id,
            numero: 1,
            carga: 0,
            realizado: 12,
        }],
    }, 200, randomUUID());
    const depois = await requisitar('/treinos/evolucao' + consulta, pessoas.aluno);
    assert.equal(depois.exercicios[0].registros[0].realizado, 12);
    assert.equal((await requisitar('/treinos/' + treino.id, pessoas.aluno)).referencia.divisao.exercicios[0].meta, 10);
});

test('fila só mostra pedidos não confirmados e exceção não é presença', async function conferir() {
    await requisitar('/treinos/chegada', pessoas.outro, 'POST');
    const caminho = '/equipe/alunos/' + pessoas.outro.alunoId;
    const autorizada = await requisitar(caminho + '/excecao', pessoas.gestao, 'POST', {
        motivo: 'Teste de autorização sem comparecimento',
    });
    assert.equal(autorizada.confirmadaEm, null);
    const fila = await requisitar('/equipe/chegadas', pessoas.recepcao);
    assert.ok(fila.some(function pendente(item) { return item.alunoId === pessoas.outro.alunoId; }));
    await requisitar('/equipe/chegadas', pessoas.aluno, 'GET', undefined, 403);
});

test('mesma chave com conteúdo diferente não repete operação financeira', async function conferir() {
    const chave = randomUUID();
    const caminho = '/financeiro/alunos/' + pessoas.aluno.alunoId + '/pagamentos';
    const entrada = {
        planoId: planoId,
        valorCentavos: 8990,
        metodo: 'pix',
    };
    await requisitar(caminho, pessoas.recepcao, 'POST', entrada, 201, chave);
    entrada.metodo = 'dinheiro';
    await requisitar(caminho, pessoas.recepcao, 'POST', entrada, 409, chave);
});

test('gestor não promove papéis superiores; desligamento revoga acesso', async function conferir() {
    const caminhoBeneficio = '/financeiro/alunos/' + pessoas.instrutor.alunoId + '/beneficios';
    await requisitar(caminhoBeneficio, pessoas.gestao, 'POST', {
        origem: 'funcional',
        inicio: diaAcademia(),
        fim: somarDias(diaAcademia(), 7),
        motivo: 'Benefício do vínculo de teste',
    }, 201, randomUUID());
    assert.equal((await requisitar('/financeiro/situacao', pessoas.instrutor)).estado, 'funcional');
    const dados = {
        papeis: ['gestao'],
        ativo: true,
        motivo: 'Teste de limites de função',
    };
    await requisitar('/funcionarios/' + pessoas.outro.contaId, pessoas.gestao, 'PUT', dados, 403);
    dados.papeis = ['instrutor'];
    dados.ativo = false;
    await requisitar('/funcionarios/' + pessoas.instrutor.contaId, pessoas.gestao, 'PUT', dados);
    await requisitar('/equipe/alunos?busca=Pessoa', pessoas.instrutor, 'GET', undefined, 403);
    await requisitar('/acesso/perfil', pessoas.instrutor);
    assert.equal((await requisitar(caminhoBeneficio, pessoas.gestao))[0].estado, 'revogado');
    assert.equal((await requisitar('/financeiro/situacao', pessoas.instrutor)).permitida, false);
});

test('notificações não duplicam pagamento e não vazam entre contas', async function conferir() {
    const notificacoes = await requisitar('/notificacoes', pessoas.aluno);
    assert.equal(notificacoes.filter(function pagamento(item) { return item.evento === 'pagamento:' + pagamentoId; }).length, 1);
    await requisitar('/notificacoes/' + notificacoes[0].id + '/lida', pessoas.outro, 'PUT');
    assert.equal((await requisitar('/notificacoes', pessoas.aluno))[0].lidaEm, null);
});

test('benefício funcional exige vínculo e cortesia não gera pagamento', async function conferir() {
    const alunoId = pessoas.outro.alunoId;
    const caminho = '/financeiro/alunos/' + alunoId + '/beneficios';
    const dados = {
        origem: 'funcional',
        inicio: diaAcademia(),
        fim: somarDias(diaAcademia(), 7),
        motivo: 'Concessão fictícia',
    };
    await requisitar(caminho, pessoas.gestao, 'POST', dados, 422, randomUUID());
    dados.origem = 'cortesia';
    await requisitar(caminho, pessoas.gestao, 'POST', dados, 201, randomUUID());
    assert.equal((await requisitar('/financeiro/situacao', pessoas.outro)).estado, 'cortesia');
    const beneficios = await requisitar(caminho, pessoas.gestao);
    assert.equal(beneficios[0].estado, 'vigente');
    assert.equal(await Pagamento.count({
        where: {
            alunoId: alunoId,
        },
    }), 0);
});


test('push usa mensagem genérica, recibo persistido e cancela entrega após logout', async function conferir(contexto) {
    const { criar } = await import('../src/repositories/notificacao-repositorio.js');
    const { default: EntregaPush } = await import('../src/models/entrega-push.js');
    const { processarUmaEntrega } = await import('../src/services/push-servico.js');
    const token = 'ExpoPushToken[' + randomUUID() + ']';
    await requisitar('/notificacoes/dispositivo', pessoas.recepcao, 'PUT', {
        token: token,
    });
    const notificacao = await criar({
        contaId: pessoas.recepcao.contaId,
        evento: 'teste:' + randomUUID(),
        mensagem: 'Conteúdo privado que não deve ir ao push',
        destino: '/notificacoes',
    });
    const fetchOriginal = globalThis.fetch;
    let chamadas = 0;
    contexto.mock.method(globalThis, 'fetch', async function simular(url, opcoes) {
        if (String(url).startsWith('https://exp.host/')) {
            chamadas += 1;
            const dados = JSON.parse(opcoes.body);
            if (String(url).endsWith('/send')) {
                assert.equal(dados.body.includes('Conteúdo privado'), false);
                return {
                    ok: true,
                    json: async function resposta() {
                        return {
                            data: {
                                status: 'ok',
                                id: 'ticket-teste',
                            },
                        };
                    },
                };
            }
            return {
                ok: true,
                json: async function resposta() {
                    return {
                        data: {
                            'ticket-teste': {
                                status: 'ok',
                            },
                        },
                    };
                },
            };
        }
        return fetchOriginal(url, opcoes);
    });
    process.env.PUSH_HABILITADO = 'true';
    try {
        await processarUmaEntrega();
        let entrega = await EntregaPush.findOne({
            where: {
                notificacaoId: notificacao.id,
            },
        });
        assert.equal(entrega.estado, 'aguardando');
        await entrega.update({
            proximaEm: new Date(0),
        });
        await processarUmaEntrega();
        await entrega.reload();
        assert.equal(entrega.estado, 'entregue');
        assert.equal(chamadas, 2);
        const posterior = await criar({
            contaId: pessoas.recepcao.contaId,
            evento: 'teste:' + randomUUID(),
            mensagem: 'Outra atualização',
            destino: '/notificacoes',
        });
        await requisitar('/acesso/sair', pessoas.recepcao, 'POST', undefined, 204);
        await processarUmaEntrega();
        entrega = await EntregaPush.findOne({
            where: {
                notificacaoId: posterior.id,
            },
        });
        assert.equal(entrega.estado, 'cancelada');
        assert.equal(chamadas, 2);
    } finally {
        process.env.PUSH_HABILITADO = 'false';
    }
});

test('recuperação bloqueada sem configuração e código de uso único revoga sessões', async function conferir() {
    await requisitar('/acesso/recuperacao', null, 'POST', {
        email: pessoas.outro.email,
    }, 503);
    process.env.RECUPERACAO_MINUTOS = '10';
    process.env.RECUPERACAO_TENTATIVAS = '3';
    await Recuperacao.create({
        contaId: pessoas.outro.contaId,
        codigoResumo: resumirCodigo(pessoas.outro.contaId, '123456'),
        expiraEm: new Date(Date.now() + 600000),
    });
    await requisitar('/acesso/recuperacao/confirmar', null, 'POST', {
        email: pessoas.outro.email,
        codigo: '000000',
        senha: 'Senha-nova-2026',
    }, 422);
    assert.equal((await Recuperacao.findByPk(pessoas.outro.contaId)).tentativas, 1);
    const dados = {
        email: pessoas.outro.email,
        codigo: '123456',
        senha: 'Senha-nova-2026',
    };
    await requisitar('/acesso/recuperacao/confirmar', null, 'POST', dados);
    await requisitar('/acesso/recuperacao/confirmar', null, 'POST', dados, 422);
    await requisitar('/acesso/perfil', pessoas.outro, 'GET', undefined, 401);
});
