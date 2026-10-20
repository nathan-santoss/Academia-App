import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularPeriodo, estadoAssinatura, exigirDia } from '../src/utils/validar-financeiro.js';
import { validarRotina } from '../src/utils/validar-rotina.js';
import { validarSeries, obterEstadoTreino } from '../src/utils/validar-treino.js';
import { interpretarResposta, normalizarEndereco } from '../../mobile/src/utils/resposta-api.js';
import { resumirOperacao } from '../src/utils/resumir-operacao.js';

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
