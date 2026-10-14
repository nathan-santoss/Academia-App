// Compartilho a sessão entre as telas e confiro o acesso salvo ao reabrir o aplicativo.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as acesso from '../services/acesso-servico';
import { acompanharSessao } from '../services/api';
import { obterToken, guardarToken, apagarToken } from '../services/token-servico';
import { limparNotificacoes } from '../services/notificacao-servico';

const AcessoContext = createContext(null);

export function AcessoProvider({ children }) {
    // Mantenho o perfil apenas na memória; ao sair, as telas privadas são desmontadas.
    const [usuario, definirUsuario] = useState(null);
    const [carregando, definirCarregando] = useState(true);
    const [erroInicial, definirErroInicial] = useState('');
    const [aviso, definirAviso] = useState('');

    const limparAvisos = useCallback(async function limparAvisos() {
        // Mantenho o acesso utilizável mesmo se o sistema de notificações estiver indisponível.
        try {
            await limparNotificacoes();
        } catch {
            definirAviso('Não consegui limpar os avisos antigos deste aparelho. Confira a central de notificações.');
        }
    }, []);

    const encerrarLocalmente = useCallback(async function encerrarLocalmente() {
        // Apago a credencial mesmo se o sistema não conseguir remover um aviso.
        await apagarToken();
        definirUsuario(null);
        await limparAvisos();
    }, [limparAvisos]);

    async function consultarSessaoSalva() {
        try {
            const token = await obterToken();
            if (token) {
                // Peço à API a confirmação antes de abrir qualquer tela pessoal.
                const resultado = await acesso.consultarPerfil();
                definirUsuario(resultado.dados);
            } else {
                definirUsuario(null);
            }
        } catch (falha) {
            // Uma queda de rede não apaga uma sessão válida; ofereço nova tentativa.
            if (falha.status !== 401) {
                definirErroInicial(falha.message);
            }
        } finally {
            definirCarregando(false);
        }
    }

    async function restaurar() {
        // Reinicio a espera apenas no toque de tentar novamente.
        definirCarregando(true);
        definirErroInicial('');
        await consultarSessaoSalva();
    }

    useEffect(function iniciarAcesso() {
        acompanharSessao(encerrarLocalmente);
        // Sincronizo a sessão com o armazenamento externo; os estados mudam após a leitura assíncrona.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        consultarSessaoSalva();
    }, [encerrarLocalmente]);

    async function entrar(email, senha) {
        // Limpo avisos da conta anterior antes de liberar uma nova identidade neste celular.
        definirAviso('');
        await limparAvisos();
        const resultado = await acesso.entrar(email, senha);
        await guardarToken(resultado.token);
        const perfil = await acesso.consultarPerfil();
        definirUsuario(perfil.dados);
    }

    async function sair() {
        // Se a rede falhar, aviso na tela e mantenho a opção de tentar encerrar novamente.
        await acesso.sair();
        await encerrarLocalmente();
    }

    return (
        <AcessoContext.Provider value={{
            usuario: usuario,
            carregando: carregando,
            erroInicial: erroInicial,
            aviso: aviso,
            restaurar: restaurar,
            entrar: entrar,
            sair: sair,
        }}
        >
            {children}
        </AcessoContext.Provider>
    );
}

export function useAcesso() {
    // Facilito a leitura da sessão nas telas sem repetir o uso direto do contexto.
    return useContext(AcessoContext);
}
