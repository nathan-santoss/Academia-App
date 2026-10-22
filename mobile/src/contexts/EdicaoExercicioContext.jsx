import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const Contexto = createContext(null);

export function EdicaoExercicioProvider({ children }) {
    const [sessao, definirSessao] = useState(null);
    const atual = useRef(null);

    const iniciar = useCallback(function iniciar(edicao) {
        if (atual.current) { return false; }
        atual.current = edicao;
        definirSessao(edicao);
        return true;
    }, []);

    const encerrar = useCallback(function encerrar(dono, edicao = null) {
        if (edicao && atual.current !== edicao) { return; }
        if (atual.current && atual.current.dono === dono) {
            atual.current = null;
            definirSessao(null);
        }
    }, []);

    const confirmar = useCallback(function confirmar(edicao, exercicio) {
        if (!edicao || atual.current !== edicao) { throw new Error('Abra o exercício pela rotina para continuar.'); }
        edicao.aoConfirmar(exercicio);
        // Encerro só depois de aplicar, impedindo inclusões duplicadas por toques rápidos.
        atual.current = null;
        definirSessao(null);
    }, []);

    const valor = useMemo(function compartilhar() {
        return {
            sessao: sessao,
            iniciar: iniciar,
            encerrar: encerrar,
            confirmar: confirmar,
        };
    }, [sessao, iniciar, encerrar, confirmar]);

    return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEdicaoExercicio() {
    return useContext(Contexto);
}
