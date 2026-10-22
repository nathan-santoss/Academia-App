import { test } from 'node:test';
import { posicionarItem } from '../../mobile/src/utils/organizar-rotina.js';
import { prepararConteudo } from '../../mobile/src/utils/validar-rotina.js';
import { rotuloOpcao } from '../../mobile/src/utils/opcoes-formulario.js';
import { dataDia, inicioPeriodo, hojeAcademia } from '../../mobile/src/utils/apresentar-dados.js';
import assert from 'node:assert/strict';
import { calcularPeriodo, estadoAssinatura, exigirDia } from '../src/utils/validar-financeiro.js';
import { validarRotina } from '../src/utils/validar-rotina.js';
import { validarSeries, obterEstadoTreino } from '../src/utils/validar-treino.js';
import { interpretarResposta, normalizarEndereco } from '../../mobile/src/utils/resposta-api.js';
import { resumirOperacao } from '../src/utils/resumir-operacao.js';

function rotinaDeFormulario() {
    return {
        nome: 'Rotina pessoal',
        divisoes: [{
            id: 'c2b21eb4-1e41-4493-b0b8-e4909ee3dbb3',
            nome: 'A',
            exercicios: [{
                id: '0db68dfa-d832-47da-9d04-2723d043ed03',
                nome: 'Agachamento',
                equipamento: 'Halteres',
                referenciaCarga: 'por halter em kg',
                tipo: 'repeticoes',
                series: '3',
                meta: '10',
                carga: '12,5',
                descanso: '0',
                observacoes: '',
            }],
        }],
    };
}

test('formulário produz um contrato aceito pelo backend sem modificar a edição', function conferir() {
    const formulario = rotinaDeFormulario();
    const conteudo = prepararConteudo(formulario);
    assert.deepEqual(validarRotina(conteudo), conteudo);
    assert.equal(conteudo.divisoes[0].exercicios[0].carga, 12.5);
    assert.equal(conteudo.divisoes[0].exercicios[0].descanso, 0);
    assert.equal(formulario.divisoes[0].exercicios[0].carga, '12,5');
    assert.equal(formulario.divisoes[0].exercicios[0].series, '3');
});

test('carga opcional e zero são distintos; descanso vazio exige escolha explícita', function conferir() {
    const formulario = rotinaDeFormulario();
    const exercicio = formulario.divisoes[0].exercicios[0];
    exercicio.carga = '';
    assert.equal(prepararConteudo(formulario).divisoes[0].exercicios[0].carga, null);
    exercicio.carga = '0';
    assert.equal(prepararConteudo(formulario).divisoes[0].exercicios[0].carga, 0);
    exercicio.descanso = '';
    assert.throws(function vazio() { prepararConteudo(formulario); }, /Divisão 1, exercício 1.*descanso/);
});

test('formulário localiza erro de meta, séries e campos de texto antes da requisição', function conferir() {
    const formulario = rotinaDeFormulario();
    const exercicio = formulario.divisoes[0].exercicios[0];
    exercicio.meta = '1,5';
    assert.throws(function fracao() { prepararConteudo(formulario); }, /meta/);
    exercicio.meta = '10';
    exercicio.series = '21';
    assert.throws(function excesso() { prepararConteudo(formulario); }, /séries/);
    exercicio.series = '3';
    exercicio.nome = ' ';
    assert.throws(function nomeVazio() { prepararConteudo(formulario); }, /Divisão 1, exercício 1.*nome/);
});

test('seleção de posição preserva identidades e desloca a sequência sem trocar os demais itens', function conferir() {
    const lista = [{
        id: 'a',
    }, {
        id: 'b',
    }, {
        id: 'c',
    }, {
        id: 'd',
    }];
    const nova = posicionarItem(lista, 0, 2);
    assert.deepEqual(nova.map(function id(item) { return item.id; }), ['b', 'c', 'a', 'd']);
    assert.strictEqual(nova[2], lista[0]);
    assert.deepEqual(lista.map(function id(item) { return item.id; }), ['a', 'b', 'c', 'd']);
    assert.strictEqual(posicionarItem(lista, 0, 10), lista);
    assert.strictEqual(posicionarItem(lista, -1, 0), lista);
});

test('duração mantém segundos e opção personalizada continua válida no contrato', function conferir() {
    const formulario = rotinaDeFormulario();
    const exercicio = formulario.divisoes[0].exercicios[0];
    exercicio.tipo = 'duracao';
    exercicio.meta = '45';
    exercicio.equipamento = 'Elástico leve';
    const conteudo = prepararConteudo(formulario);
    assert.equal(validarRotina(conteudo).divisoes[0].exercicios[0].meta, 45);
    assert.equal(conteudo.divisoes[0].exercicios[0].equipamento, 'Elástico leve');
    assert.equal(conteudo.divisoes[0].exercicios[0].id, exercicio.id);
});

test('datas de negócio não retrocedem por fuso e rótulos não mudam valores enviados', function conferir() {
    assert.equal(dataDia('2026-10-20'), '20/10/2026');
    assert.match(hojeAcademia(), /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(inicioPeriodo(0), hojeAcademia());
    assert.equal(rotuloOpcao('duracao'), 'Duração em segundos');
    assert.equal(rotuloOpcao('false'), 'Não');
    assert.equal(rotuloOpcao('35'), '35');
});

test('cinco dias gratuitos e retomada após suspensão', function conferir() {
    const assinatura = calcularPeriodo('2026-09-19', 'mensal');
    assert.equal(assinatura.vencimento, '2026-10-19');
    assert.equal(estadoAssinatura(assinatura, '2026-10-18'), 'vigente');
    assert.equal(estadoAssinatura(assinatura, '2026-10-19'), 'tolerancia');
    assert.equal(estadoAssinatura(assinatura, '2026-10-23'), 'tolerancia');
    assert.equal(estadoAssinatura(assinatura, '2026-10-24'), 'suspensa');
    assert.equal(calcularPeriodo(assinatura.vencimento, 'mensal').vencimento, '2026-11-19');
});

test('diário e quinzenal não recebem tolerância', function conferir() {
    assert.equal(calcularPeriodo('2026-10-19', 'diario').toleranciaAte, '2026-10-20');
    assert.equal(calcularPeriodo('2026-10-19', 'quinzenal').toleranciaAte, '2026-11-03');
});

test('pendências e datas inexistentes são rejeitadas', function conferir() {
    assert.throws(function pendente() { calcularPeriodo('2026-01-31', 'mensal'); }, {
        statusOperacao: 409,
    });
    assert.throws(function dataInvalida() { exigirDia('2026-02-30'); }, {
        statusOperacao: 422,
    });
});

test('cancelamento preserva o período já pago', function conferir() {
    const assinatura = Object.assign(calcularPeriodo('2026-09-19', 'mensal'), {
        canceladaEm: new Date(),
    });
    assert.equal(estadoAssinatura(assinatura, '2026-10-18'), 'vigente');
});

test('cliente preserva status de proxy HTML, 401 e conflito', function conferir() {
    assert.throws(function proxy() { interpretarResposta('<html>bad gateway</html>', 502, false); }, {
        status: 502,
    });
    assert.throws(function sessao() { interpretarResposta('', 401, false); }, {
        status: 401,
    });
    assert.throws(function conflito() { interpretarResposta('{"mensagem":"Conflito"}', 409, false); }, {
        status: 409,
        message: 'Conflito',
    });
    assert.throws(function invalida() { interpretarResposta('HTML', 200, true); }, {
        status: 200,
    });
    assert.equal(normalizarEndereco(' https://academia.example/ '), 'https://academia.example/api/v1');
    assert.equal(normalizarEndereco('https://academia.example/api/v1/'), 'https://academia.example/api/v1');
    assert.throws(function privado() { normalizarEndereco('https://usuario:senha@academia.example'); });
});

test('idempotência independe da ordem das propriedades JSON', function conferir() {
    assert.equal(resumirOperacao({
        b: 2,
        a: 1,
    }), resumirOperacao({
        a: 1,
        b: 2,
    }));
});

test('rotina vazia e séries inválidas não viram treino completo', function conferir() {
    assert.throws(function vazia() { validarRotina({
        nome: 'Vazia',
        divisoes: [],
    }); });
    const referencia = {
        divisao: {
            exercicios: [{
                id: '5b1389c2-15f5-4a24-865c-a3b266879880',
                series: 3,
            }],
        },
    };
    assert.equal(obterEstadoTreino(true, [], referencia), 'parcial');
    assert.throws(function duplicada() {
        validarSeries([{
            exercicioId: referencia.divisao.exercicios[0].id,
            numero: 4,
            carga: 20,
            realizado: 10,
        }], referencia);
    });
});
