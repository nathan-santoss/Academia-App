// Compartilho a sessão entre as telas e confiro o acesso salvo ao reabrir o aplicativo.
// Ligo as telas ao serviço de acesso e ao token protegido do celular. No login, espero a API confirmar, guardo o
// token e carrego o perfil; na saída, encerro a sessão e retiro os dados da memória e os avisos locais.

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as acesso from '../services/acesso-servico';
import { acompanharSessao } from '../services/api';
import { obterToken, guardarToken, apagarToken } from '../services/token-servico';
import { limparNotificacoes } from '../services/notificacao-servico';
import { guardarIdentidade, obterIdentidade, apagarIdentidade } from '../services/identidade-local-servico';

// Preparo AcessoContext com esta chamada. Crio o canal de valores compartilhados; o Provider fornece os dados e
// useContext faz a leitura.
const AcessoContext = createContext(null);

// Compartilho a sessão com as telas filhas para não precisar passar o mesmo acesso de componente em componente.
export function AcessoProvider({ children }) {
    // Mantenho o perfil confirmado somente na memória do aplicativo. Uso definirUsuario para mudar esse estado e
    // pedir ao React que atualize a tela.
    const [usuario, definirUsuario] = useState(null);
    // Controlo a espera enquanto os dados ainda não chegaram. Uso definirCarregando para mudar esse estado e pedir ao
    // React que atualize a tela.
    const [carregando, definirCarregando] = useState(true);
    // Reservo a falha da leitura inicial da sessão para permitir uma nova tentativa. Uso definirErroInicial para
    // mudar esse estado e pedir ao React que atualize a tela.
    const [erroInicial, definirErroInicial] = useState('');
    // Separo a orientação que pode aparecer junto dos dados. Uso definirAviso para mudar esse estado e pedir ao React
    // que atualize a tela.
    const [aviso, definirAviso] = useState('');

    // Peço ao sistema que retire os avisos antigos e mostro uma orientação se essa limpeza falhar. Mantenho a
    // referência da função enquanto suas dependências não mudam, evitando repetir efeitos só por uma nova
    // renderização.
    const limparAvisos = useCallback(async function limparAvisos() {
        // Mantenho o acesso utilizável mesmo se o sistema de notificações estiver indisponível.
        try {
            // Espero esta tarefa terminar antes de continuar. Chamo limparNotificacoes em notificacao-servico.js.
            // Nesse passo, retiro avisos agendados e já exibidos para a próxima pessoa não herdar as notificações da
            // conta anterior.
            await limparNotificacoes();
        // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
        } catch {
            // Atualizo aviso no estado; o React usa o novo valor na próxima renderização.
            definirAviso('Não consegui limpar os avisos antigos deste aparelho. Confira a central de notificações.');
        } // Termino o tratamento desta falha e sigo para a limpeza, quando houver.
    }, []); // Mantenho esta função sem dependências que variem entre renderizações.

    // Retiro o token protegido, limpo o perfil da memória e peço a remoção dos avisos locais. Mantenho a referência
    // da função enquanto suas dependências não mudam, evitando repetir efeitos só por uma nova renderização.
    const encerrarLocalmente = useCallback(async function encerrarLocalmente() {
        // Apago a credencial mesmo se o sistema não conseguir remover um aviso.
        await apagarToken();
        await apagarIdentidade();
        // Atualizo usuario no estado; o React usa o novo valor na próxima renderização.
        definirUsuario(null);
        // Espero esta tarefa terminar antes de continuar. Peço ao sistema que retire os avisos antigos e mostro uma
        // orientação se essa limpeza falhar.
        await limparAvisos();
    }, [limparAvisos]); // Acompanho limparAvisos para refazer esta preparação quando essas referências mudarem.

    // Leio o token do celular e confirmo o perfil na API antes de abrir as telas pessoais.
    async function consultarSessaoSalva() {
        // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
        // await.
        try {
            // Espero o resultado antes de preencher token. Chamo obterToken em token-servico.js. Nesse passo, leio a
            // credencial no armazenamento protegido do sistema para recuperar o acesso do aparelho.
            const token = await obterToken();
            // Continuo com a credencial encontrada para consultar o acesso da conta.
            if (token) {
                // Peço à API a confirmação antes de abrir qualquer tela pessoal.
                const resultado = await acesso.consultarPerfil();
                await guardarIdentidade(resultado.dados);
                // Atualizo usuario no estado; o React usa o novo valor na próxima renderização.
                definirUsuario(resultado.dados);
            // Sigo este caminho quando a condição anterior não foi atendida.
            } else {
                // Atualizo usuario no estado; o React usa o novo valor na próxima renderização.
                definirUsuario(null);
            } // Encerro a conferência de token.
        // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
        } catch (falha) {
            // Uma queda de rede não apaga uma sessão válida; ofereço nova tentativa.
            if (falha.status !== 401) {
                const token = await obterToken();
                const identidade = await obterIdentidade();
                if (token && identidade && !falha.status) {
                    definirUsuario(identidade);
                    definirAviso('Sem conexão: somente o rascunho do treino está disponível. A API conferirá sua sessão antes de sincronizar.');
                    return;
                }
                // Atualizo erroInicial no estado; o React usa o novo valor na próxima renderização.
                definirErroInicial(falha.message);
            } // Encerro a conferência de falha.status.
        // Executo esta limpeza tanto no sucesso quanto na falha para não deixar controles presos.
        } finally {
            // Atualizo carregando no estado; o React usa o novo valor na próxima renderização.
            definirCarregando(false);
        } // Concluo a etapa de limpeza do finally.
    } // Termino consultarSessaoSalva e devolvo o controle a quem chamou.

    // Recomeço a espera e tento recuperar a sessão de novo quando a pessoa toca em Tentar novamente.
    async function restaurar() {
        // Reinicio a espera apenas no toque de tentar novamente.
        definirCarregando(true);
        // Atualizo erroInicial no estado; o React usa o novo valor na próxima renderização.
        definirErroInicial('');
        // Espero esta tarefa terminar antes de continuar. Leio o token do celular e confirmo o perfil na API antes de
        // abrir as telas pessoais.
        await consultarSessaoSalva();
    } // Termino restaurar e devolvo o controle a quem chamou.

    // Registro quem deve limpar a sessão em uma resposta 401 e começo a leitura do acesso salvo. Registro um efeito
    // para depois da renderização; a lista de dependências define quando preciso repeti-lo.
    useEffect(function iniciarAcesso() {
        // Chamo acompanharSessao em api.js. Nesse passo, guardo a função do contexto que devo chamar quando uma
        // resposta da API encerrar a sessão.
        acompanharSessao(encerrarLocalmente);
        // Sincronizo a sessão com o armazenamento externo; os estados mudam após a leitura assíncrona.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        consultarSessaoSalva();
    }, [encerrarLocalmente]); // Acompanho encerrarLocalmente para refazer esta preparação quando essas referências mudarem.

    // Limpo avisos antigos, faço o login, guardo a credencial e busco o perfil; só então libero as telas pessoais.
    async function entrar(email, senha) {
        // Limpo avisos da conta anterior antes de liberar uma nova identidade neste celular.
        definirAviso('');
        // Espero esta tarefa terminar antes de continuar. Peço ao sistema que retire os avisos antigos e mostro uma
        // orientação se essa limpeza falhar.
        await limparAvisos();
        // Espero o resultado antes de preencher resultado. Chamo acesso.entrar em acesso-servico.js. Nesse passo,
        // envio e-mail e senha ao login público; a resposta traz a credencial que o contexto vai guardar.
        const resultado = await acesso.entrar(email, senha);
        await apagarIdentidade();
        // Espero esta tarefa terminar antes de continuar. Chamo guardarToken em token-servico.js. Nesse passo, salvo
        // a credencial no SecureStore para recuperar a sessão sem guardar a senha digitada.
        await guardarToken(resultado.token);
        // Espero o resultado antes de preencher perfil. Chamo acesso.consultarPerfil em acesso-servico.js. Nesse
        // passo, peço o perfil com a sessão atual; a API descobre o aluno pelo token, sem receber um ID escolhido
        // pela tela.
        const perfil = await acesso.consultarPerfil();
        await guardarIdentidade(perfil.dados);
        // Atualizo usuario no estado; o React usa o novo valor na próxima renderização.
        definirUsuario(perfil.dados);
    } // Termino entrar e devolvo o controle a quem chamou.

    // Encerro a sessão pela API e só depois limpo o acesso no aparelho para não simular um logout que falhou no
    // servidor.
    async function sair() {
        // Se a rede falhar, aviso na tela e mantenho a opção de tentar encerrar novamente.
        await acesso.sair();
        // Espero esta tarefa terminar antes de continuar. Retiro o token protegido, limpo o perfil da memória e peço
        // a remoção dos avisos locais.
        await encerrarLocalmente();
    } // Termino sair e devolvo o controle a quem chamou.

    // Devolvo os componentes que o React deve montar para esta parte da tela.
    return (
        // Forneço os valores abaixo pelo contexto; as telas filhas podem lê-los com o hook correspondente sem receber
        // cada valor por parâmetro.
        <AcessoContext.Provider value={{
            // Compartilho o perfil confirmado pela API para as telas saberem qual conta está aberta.
            usuario: usuario,
            // Compartilho se a leitura inicial ainda está em andamento para as telas apresentarem a espera.
            carregando: carregando,
            // Disponibilizo a falha da consulta inicial para o layout oferecer uma nova tentativa.
            erroInicial: erroInicial,
            // Compartilho uma orientação que a tela pode mostrar sem bloquear os dados já carregados.
            aviso: aviso,
            // Entrego a função de tentar novamente; ela será chamada pela ação da tela.
            restaurar: restaurar,
            // Disponibilizo a função de login para a tela usar o fluxo centralizado no contexto.
            entrar: entrar,
            // Ofereço a função de saída para encerrar a sessão pelo mesmo fluxo em todas as telas.
            sair: sair,
        }} // Concluo este objeto com os campos que a etapa atual precisa.
        // Concluo os atributos de AcessoContext.Provider e começo seu conteúdo filho.
        >
            {/* Mostro aqui as telas filhas recebidas pelo Provider, que já podem ler o contexto. */}
            {children}
            {/* Encerro o conteúdo de AcessoContext.Provider; os próximos elementos ficam fora deste bloco. */}
        </AcessoContext.Provider>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino AcessoProvider e devolvo o controle a quem chamou.

// Disponibilizo o contexto de acesso para que as telas leiam a mesma sessão e chamem entrar ou sair.
export function useAcesso() {
    // Facilito a leitura da sessão nas telas sem repetir o uso direto do contexto.
    return useContext(AcessoContext);
} // Termino useAcesso e devolvo o controle a quem chamou.
