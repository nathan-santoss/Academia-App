// Compartilho a preferência de vibração e coordeno sua leitura e gravação no aparelho.
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { lerPreferencias, salvarPreferencias } from '../services/preferencias-servico';

const PreferenciasContext = createContext(null);

export function PreferenciasProvider({ children }) {
    const [vibracaoAtiva, definirVibracaoAtiva] = useState(false);
    const [carregando, definirCarregando] = useState(true);
    const [salvando, definirSalvando] = useState(false);
    const [erro, definirErro] = useState('');
    const gravacaoEmAndamento = useRef(false);

    // Leio a escolha anterior antes de permitir alterações, sem gravar o padrão por cima dela.
    useEffect(function carregarPreferencias() {
        let ativo = true;

        async function carregar() {
            try {
                const vibracao = await lerPreferencias();

                if (ativo) {
                    definirVibracaoAtiva(vibracao);
                }
            } catch {
                if (ativo) {
                    definirErro('Não consegui recuperar a preferência. Escolha novamente para salvá-la.');
                }
            } finally {
                if (ativo) {
                    definirCarregando(false);
                }
            }
        }

        carregar();

        return function encerrarLeitura() {
            ativo = false;
        };
    }, []);

    async function alterarVibracao(valor) {
        // Evito gravações simultâneas para preservar a ordem das escolhas.
        if (carregando || gravacaoEmAndamento.current) {
            return;
        }

        gravacaoEmAndamento.current = true;
        definirSalvando(true);
        definirErro('');

        try {
            await salvarPreferencias(valor);
            // Compartilho o novo valor somente depois que ele foi salvo no aparelho.
            definirVibracaoAtiva(valor);
        } catch {
            definirErro('Não foi possível salvar a preferência. Tente novamente.');
        } finally {
            gravacaoEmAndamento.current = false;
            definirSalvando(false);
        }
    }

    return (
        <PreferenciasContext.Provider value={{
            vibracaoAtiva: vibracaoAtiva,
            carregando: carregando,
            salvando: salvando,
            erro: erro,
            alterarVibracao: alterarVibracao,
        }}
        >
            {children}
        </PreferenciasContext.Provider>
    );
}

export function usePreferencias() {
    // Mantenho o prefixo use exigido pelo React para identificar meu hook de contexto.
    return useContext(PreferenciasContext);
}
