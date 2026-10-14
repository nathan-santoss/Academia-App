// Compartilho a preferência de vibração e coordeno sua leitura e gravação no aparelho.
// Compartilho a escolha de vibração entre as telas. Primeiro leio o AsyncStorage; quando a pessoa muda a escolha,
// espero a gravação antes de atualizar o contexto para manter tela e armazenamento de acordo.

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { lerPreferencias, salvarPreferencias } from '../services/preferencias-servico';

// Preparo PreferenciasContext com esta chamada. Crio o canal de valores compartilhados; o Provider fornece os dados e
// useContext faz a leitura.
const PreferenciasContext = createContext(null);

// Compartilho a escolha de vibração e o estado de sua leitura e gravação com as telas do app.
export function PreferenciasProvider({ children }) {
    // Compartilho a escolha de vibração que os formulários devem respeitar. Uso definirVibracaoAtiva para mudar esse
    // estado e pedir ao React que atualize a tela.
    const [vibracaoAtiva, definirVibracaoAtiva] = useState(false);
    // Controlo a espera enquanto os dados ainda não chegaram. Uso definirCarregando para mudar esse estado e pedir ao
    // React que atualize a tela.
    const [carregando, definirCarregando] = useState(true);
    // Sinalizo que há uma gravação em andamento. Uso definirSalvando para mudar esse estado e pedir ao React que
    // atualize a tela.
    const [salvando, definirSalvando] = useState(false);
    // Reservo a mensagem de falha que será mostrada à pessoa. Uso definirErro para mudar esse estado e pedir ao React
    // que atualize a tela.
    const [erro, definirErro] = useState('');
    // Mantenho gravacaoEmAndamento numa referência; leio e altero current sem esperar uma nova renderização.
    const gravacaoEmAndamento = useRef(false);

    // Leio a escolha anterior antes de permitir alterações, sem gravar o padrão por cima dela.
    useEffect(function carregarPreferencias() {
        // Inicio ativo com true; vou ajustar esse valor conforme as condições abaixo.
        let ativo = true;

        // Espero a leitura externa terminar antes de atualizar o estado, e confiro se o componente ainda está em uso.
        async function carregar() {
            // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas
            // com await.
            try {
                // Espero o resultado antes de preencher vibracao. Chamo lerPreferencias em preferencias-servico.js.
                // Nesse passo, leio o texto guardado no AsyncStorage e recupero a escolha de vibração, com um padrão
                // quando não há registro.
                const vibracao = await lerPreferencias();

                // Confirmo que o efeito continua ativo antes de atualizar o contexto.
                if (ativo) {
                    // Atualizo vibracaoAtiva no estado; o React usa o novo valor na próxima renderização.
                    definirVibracaoAtiva(vibracao);
                } // Encerro a conferência de ativo.
            // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
            } catch {
                // Confirmo que o efeito continua ativo antes de atualizar o contexto.
                if (ativo) {
                    // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
                    definirErro('Não consegui recuperar a preferência. Escolha novamente para salvá-la.');
                } // Encerro a conferência de ativo.
            // Executo esta limpeza tanto no sucesso quanto na falha para não deixar controles presos.
            } finally {
                // Confirmo que o efeito continua ativo antes de atualizar o contexto.
                if (ativo) {
                    // Atualizo carregando no estado; o React usa o novo valor na próxima renderização.
                    definirCarregando(false);
                } // Encerro a conferência de ativo.
            } // Concluo a etapa de limpeza do finally.
        } // Termino carregar e devolvo o controle a quem chamou.

        // Espero a leitura externa terminar antes de atualizar o estado, e confiro se o componente ainda está em uso.
        carregar();

        // Devolvo a função de limpeza para o React chamá-la quando este efeito for encerrado.
        return function encerrarLeitura() {
            // Atualizo ativo com false.
            ativo = false;
        }; // Termino encerrarLeitura e devolvo o controle a quem chamou.
    }, []); // Registro este efeito sem valores variáveis na lista de dependências.

    // Salvo a escolha no aparelho antes de compartilhá-la com as telas, evitando mostrar um valor que não foi
    // gravado.
    async function alterarVibracao(valor) {
        // Evito gravações simultâneas para preservar a ordem das escolhas.
        if (carregando || gravacaoEmAndamento.current) {
            // Termino esta chamada aqui para não executar os próximos passos deste caminho.
            return;
        } // Encerro a conferência de carregando.

        // Atualizo gravacaoEmAndamento.current com true.
        gravacaoEmAndamento.current = true;
        // Atualizo salvando no estado; o React usa o novo valor na próxima renderização.
        definirSalvando(true);
        // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
        definirErro('');

        // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas com
        // await.
        try {
            // Espero esta tarefa terminar antes de continuar. Chamo salvarPreferencias em preferencias-servico.js.
            // Nesse passo, transformo a preferência em texto para guardá-la no AsyncStorage sob uma chave conhecida.
            await salvarPreferencias(valor);
            // Compartilho o novo valor somente depois que ele foi salvo no aparelho.
            definirVibracaoAtiva(valor);
        // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
        } catch {
            // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
            definirErro('Não foi possível salvar a preferência. Tente novamente.');
        // Executo esta limpeza tanto no sucesso quanto na falha para não deixar controles presos.
        } finally {
            // Atualizo gravacaoEmAndamento.current com false.
            gravacaoEmAndamento.current = false;
            // Atualizo salvando no estado; o React usa o novo valor na próxima renderização.
            definirSalvando(false);
        } // Concluo a etapa de limpeza do finally.
    } // Termino alterarVibracao e devolvo o controle a quem chamou.

    // Devolvo os componentes que o React deve montar para esta parte da tela.
    return (
        // Forneço os valores abaixo pelo contexto; as telas filhas podem lê-los com o hook correspondente sem receber
        // cada valor por parâmetro.
        <PreferenciasContext.Provider value={{
            // Compartilho a escolha de vibração para os formulários respeitarem essa preferência.
            vibracaoAtiva: vibracaoAtiva,
            // Compartilho se a leitura inicial ainda está em andamento para as telas apresentarem a espera.
            carregando: carregando,
            // Informo se há uma gravação em andamento para a tela bloquear novas alterações.
            salvando: salvando,
            // Entrego a mensagem de falha do contexto para a tela apresentá-la junto da preferência.
            erro: erro,
            // Disponibilizo a função que salva a preferência antes de confirmar sua mudança na tela.
            alterarVibracao: alterarVibracao,
        }} // Concluo este objeto com os campos que a etapa atual precisa.
        // Concluo os atributos de PreferenciasContext.Provider e começo seu conteúdo filho.
        >
            {/* Mostro aqui as telas filhas recebidas pelo Provider, que já podem ler o contexto. */}
            {children}
            {/* Encerro o conteúdo de PreferenciasContext.Provider; os próximos elementos ficam fora deste bloco. */}
        </PreferenciasContext.Provider>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino PreferenciasProvider e devolvo o controle a quem chamou.

// Disponibilizo o contexto de preferências; uso o prefixo use porque esta função é um hook do React.
export function usePreferencias() {
    // Mantenho o prefixo use exigido pelo React para identificar meu hook de contexto.
    return useContext(PreferenciasContext);
} // Termino usePreferencias e devolvo o controle a quem chamou.
