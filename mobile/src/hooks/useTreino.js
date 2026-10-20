// Cuido do treino em andamento: recupero a cópia do aparelho, guardo as séries e envio para a academia.
// Só apago um treino encerrado depois da confirmação do servidor, para uma queda da internet não apagar o esforço do aluno.
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { consultarTreino, consultarTreinoAtivo, sincronizarTreino } from '../services/treino-servico';
import { lerRascunho, guardarRascunho, apagarRascunho } from '../services/rascunho-treino-servico';

export default function useTreino(alunoId) {
    const [rascunho, definirRascunho] = useState(null);
    const [mensagem, definirMensagem] = useState('Recuperando treino…');
    const [ocupado, definirOcupado] = useState(true);
    const [falhaRecuperacao, definirFalhaRecuperacao] = useState(false);
    const [tentativa, definirTentativa] = useState(0);
    const atual = useRef(null);
    const trava = useRef(false);
    const conflito = useRef(false);
    const [temConflito, definirTemConflito] = useState(false);
    const montado = useRef(true);

    const apresentar = useCallback(function apresentar(dados) {
        atual.current = dados;
        if (montado.current) { definirRascunho(dados); }
    }, []);

    const sincronizar = useCallback(async function sincronizar() {
        if (conflito.current || trava.current || !atual.current || !atual.current.pendente) { return; }
        trava.current = true;
        definirOcupado(true);
        let continuar = false;
        try {
            const salvo = atual.current;
            const confirmado = await sincronizarTreino(salvo.treino.id, salvo.pendente);
            // Deixo a próxima abertura reconciliar a resposta para não sobrescrever uma nova tela.
            if (!montado.current) { return; }
            if (confirmado.estado !== 'ativo') {
                await apagarRascunho(alunoId, 'treino');
                apresentar(null);
                definirMensagem('Treino ' + confirmado.estado + ' confirmado. Consulte seu histórico.');
            } else {
                let pendente = null;
                const mudou = JSON.stringify(salvo.treino.series) !== JSON.stringify(salvo.pendente.series);
                if (mudou || salvo.encerrarPendente) {
                    pendente = {
                        operacaoId: randomUUID(),
                        revisao: confirmado.revisao,
                        series: salvo.treino.series,
                        encerrar: Boolean(salvo.encerrarPendente),
                    };
                    continuar = true;
                }
                const novo = {
                    treino: Object.assign({}, confirmado, {
                        series: salvo.treino.series,
                    }),
                    pendente: pendente,
                    encerrarPendente: Boolean(salvo.encerrarPendente),
                    descansoAte: salvo.descansoAte,
                };
                await guardarRascunho(alunoId, 'treino', novo);
                apresentar(novo);
                definirMensagem('Séries confirmadas pela academia.');
            }
        } catch (falha) {
            // Paro a sequência também se o armazenamento falhar. Repetir aqui sem esperar criaria um ciclo de pedidos.
            continuar = false;
            if (falha.status === 409) {
                conflito.current = true;
                definirTemConflito(true);
            }
            definirMensagem(falha.message + ' O registro local permanece protegido e pendente.');
        } finally {
            trava.current = false;
            if (montado.current) { definirOcupado(false); }
        }
        if (continuar && montado.current) { await sincronizar(); }
    }, [alunoId, apresentar]);

    useEffect(function carregar() {
        montado.current = true;
        async function recuperar() {
            definirOcupado(true);
            definirFalhaRecuperacao(false);
            try {
                const local = await lerRascunho(alunoId, 'treino');
                if (!montado.current) { return; }
                if (local) {
                    apresentar(local);
                    definirMensagem('Treino recuperado do aparelho.');
                    if (local.pendente) {
                        await sincronizar();
                    } else {
                        const confirmado = await consultarTreino(local.treino.id);
                        if (!montado.current) { return; }
                        if (confirmado.estado !== 'ativo') {
                            await apagarRascunho(alunoId, 'treino');
                            apresentar(null);
                            definirMensagem('Este treino já foi encerrado e está no histórico.');
                        } else {
                            const novo = Object.assign({}, local, {
                                treino: confirmado,
                            });
                            await guardarRascunho(alunoId, 'treino', novo);
                            apresentar(novo);
                        }
                    }
                } else {
                    let treino = await consultarTreinoAtivo();
                    const inicio = await lerRascunho(alunoId, 'inicio-treino');
                    if (!treino && inicio) {
                        try { treino = await consultarTreino(inicio.dados.id); }
                        catch (falha) {
                            if (falha.status !== 404) { throw falha; }
                            await apagarRascunho(alunoId, 'inicio-treino');
                        }
                    }
                    if (treino && treino.estado !== 'ativo') {
                        await apagarRascunho(alunoId, 'inicio-treino');
                        treino = null;
                    }
                    if (!montado.current) { return; }
                    if (treino) {
                        const novo = {
                            treino: treino,
                            pendente: null,
                            descansoAte: 0,
                        };
                        await guardarRascunho(alunoId, 'treino', novo);
                        await apagarRascunho(alunoId, 'inicio-treino');
                        if (montado.current) { apresentar(novo); }
                    }
                    definirMensagem('');
                }
            } catch (falha) {
                if (montado.current) {
                    // Distingo uma falha na consulta da confirmação de que realmente não existe um treino.
                    definirFalhaRecuperacao(true);
                    definirMensagem(falha.message);
                }
            } finally {
                if (montado.current) { definirOcupado(false); }
            }
        }
        recuperar();
        const intervalo = setInterval(sincronizar, 30000);
        const assinatura = AppState.addEventListener('change', function retomar(estado) {
            if (estado === 'active') { sincronizar(); }
        });
        return function sair() {
            montado.current = false;
            clearInterval(intervalo);
            assinatura.remove();
        };
    }, [alunoId, apresentar, sincronizar, tentativa]);

    function recuperarNovamente() {
        // Permito repetir a abertura quando a rede volta, sem exigir que o aluno saia e entre na tela.
        if (!ocupado && !trava.current) {
            definirTentativa(tentativa + 1);
        }
    }

    async function registrar(series, encerrar, descansoSegundos) {
        if (conflito.current) { definirMensagem('Resolva a divergência com o servidor antes de registrar outras séries.'); return; }
        if (trava.current || !atual.current) { return; }
        if (atual.current.encerrarPendente) {
            definirMensagem('O encerramento está pendente. Sincronize para concluir.');
            return;
        }
        trava.current = true;
        definirOcupado(true);
        try {
            let descansoAte = atual.current.descansoAte;
            if (descansoSegundos !== null) {
                descansoAte = Date.now() + descansoSegundos * 1000;
            }
            const treino = atual.current.treino;
            let pendente = atual.current.pendente;
            // Preservo o conteúdo de um pedido sem resposta e acumulo novas séries à parte.
            if (!pendente) {
                pendente = {
                    operacaoId: randomUUID(),
                    revisao: treino.revisao,
                    series: series,
                    encerrar: encerrar,
                };
            }
            const novo = {
                treino: Object.assign({}, treino, {
                    series: series,
                }),
                pendente: pendente,
                encerrarPendente: encerrar,
                descansoAte: descansoAte,
            };
            await guardarRascunho(alunoId, 'treino', novo);
            apresentar(novo);
            definirMensagem('Registro protegido no aparelho, aguardando confirmação.');
        } catch (falha) {
            definirMensagem('Não foi possível salvar no aparelho: ' + falha.message);
        } finally {
            trava.current = false;
            definirOcupado(false);
        }
        await sincronizar();
    }

    async function alterarDescanso(ate) {
        if (trava.current || !atual.current) { return; }
        trava.current = true;
        try {
            const novo = Object.assign({}, atual.current, {
                descansoAte: ate,
            });
            await guardarRascunho(alunoId, 'treino', novo);
            apresentar(novo);
        } catch (falha) {
            definirMensagem(falha.message);
        } finally {
            trava.current = false;
        }
    }

    async function recuperarConfirmado() {
        if (trava.current || !atual.current) { return; }
        trava.current = true;
        definirOcupado(true);
        try {
            const confirmado = await consultarTreino(atual.current.treino.id);
            if (confirmado.estado !== 'ativo') {
                await apagarRascunho(alunoId, 'treino');
                apresentar(null);
            } else {
                const novo = {
                    treino: confirmado,
                    pendente: null,
                    descansoAte: 0,
                    encerrarPendente: false,
                };
                await guardarRascunho(alunoId, 'treino', novo);
                apresentar(novo);
            }
            conflito.current = false;
            definirTemConflito(false);
            definirMensagem('Versão confirmada recuperada. Confira as séries antes de continuar.');
        } catch (falha) { definirMensagem(falha.message); }
        finally { trava.current = false; definirOcupado(false); }
    }

    return {
        temConflito,
        recuperarConfirmado,
        rascunho,
        mensagem,
        ocupado,
        falhaRecuperacao,
        recuperarNovamente,
        registrar,
        sincronizar,
        alterarDescanso,
    };
}
