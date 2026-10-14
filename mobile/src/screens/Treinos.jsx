// Reúno a chegada, as rotinas disponíveis e a retomada do treino do aluno.
// Daqui eu abro a execução da divisão escolhida, mantendo a rotina pessoal separada da ficha do instrutor.
import { useCallback, useRef, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { useAcesso } from '../contexts/AcessoContext';
import Botao from '../components/Botao';
import ResumoRotina from '../components/ResumoRotina';
import * as servico from '../services/treino-servico';
import { consultarPapeis } from '../services/equipe-servico';
import { lerRascunho, guardarRascunho } from '../services/rascunho-treino-servico';
import { estilos } from '../theme/tema';

export default function Treinos() {
    const { usuario } = useAcesso();
    const [rotinas, definirRotinas] = useState(null);
    const [chegada, definirChegada] = useState(null);
    const [ativo, definirAtivo] = useState(false);
    const [equipe, definirEquipe] = useState(false);
    const [ocupado, definirOcupado] = useState(false);
    const [mensagem, definirMensagem] = useState('');
    const [atualizacao, definirAtualizacao] = useState(0);
    // Bloqueio dois toques imediatos, antes mesmo de o React redesenhar o botão como desabilitado.
    const iniciando = useRef(false);

    useFocusEffect(useCallback(function carregar() {
        let visivel = true;
        async function consultar() {
            definirOcupado(true);
            try {
                const local = await lerRascunho(usuario.id, 'treino');
                if (visivel && local) { definirAtivo(true); }
                const resultados = await Promise.all([servico.consultarRotinas(), servico.consultarChegada(), servico.consultarTreinoAtivo(), consultarPapeis()]);
                if (!visivel) { return; }
                definirRotinas(resultados[0]);
                definirChegada(resultados[1]);
                definirAtivo(Boolean(local || resultados[2]));
                definirEquipe(resultados[3].length > 0);
                definirMensagem('');
            } catch (falha) {
                if (visivel) { definirMensagem(falha.message); }
            } finally {
                if (visivel) { definirOcupado(false); }
            }
        }
        consultar();
        return function sair() { visivel = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Reconsulto ao tocar em Atualizar, além de retornar à tela.
    }, [usuario.id, atualizacao]));

    async function solicitar() {
        definirOcupado(true);
        try {
            definirChegada(await servico.solicitarChegada());
            definirMensagem('Solicitação registrada. Procure a recepção para confirmar sua presença.');
        } catch (falha) { definirMensagem(falha.message); }
        finally { definirOcupado(false); }
    }

    async function iniciar(rotina, divisao) {
        if (iniciando.current || ocupado || ativo) { return; }
        iniciando.current = true;
        definirOcupado(true);
        try {
            const treino = await servico.iniciarTreino({
                id: randomUUID(),
                rotinaId: rotina.id,
                origem: rotina.origem,
                divisaoId: divisao.id,
            });
            // Lembro que o servidor já abriu a sessão, mesmo se o aparelho não conseguir guardar a cópia.
            definirAtivo(true);
            await guardarRascunho(usuario.id, 'treino', {
                treino: treino,
                pendente: null,
                descansoAte: 0,
            });
            router.push('/treinos/executar');
        } catch (falha) {
            definirMensagem(falha.message + ' Se o início não recebeu resposta, use Retomar treino para consultar a sessão.');
        } finally {
            iniciando.current = false;
            definirOcupado(false);
        }
    }

    let estadoChegada = 'Chegada ainda não solicitada.';
    let confirmada = false;
    if (chegada) {
        estadoChegada = 'Aguardando autorização e confirmação presencial.';
        if (chegada.autorizadaEm) { estadoChegada = 'Entrada autorizada para hoje. Aguarde a confirmação presencial da recepção.'; }
        if (chegada.confirmadaEm) { estadoChegada = 'Chegada de hoje confirmada pela recepção.'; confirmada = true; }
    }

    return (
        <SafeAreaView
            style={estilos.tela}
            edges={['bottom', 'left', 'right']}
        >
            <ScrollView contentContainerStyle={estilos.conteudo}>
                <Text style={estilos.etiqueta}>SEU TREINO</Text>
                <Text style={estilos.titulo}>{'Olá, ' + usuario.nome}</Text>
                <Text style={estilos.descricao}>{estadoChegada}</Text>
                {Boolean(mensagem) && (
                    <Text
                        accessibilityLiveRegion="polite"
                        style={estilos.descricao}
                    >{mensagem}</Text>
                )}
                <Botao
                    titulo="Atualizar"
                    secundario
                    desabilitado={ocupado}
                    aoPressionar={function atualizar() { definirAtualizacao(atualizacao + 1); }}
                />
                {!confirmada && (
                    <Botao
                        titulo="Solicitar chegada de hoje"
                        desabilitado={ocupado}
                        aoPressionar={solicitar}
                    />
                )}
                <Botao
                    titulo="Retomar treino"
                    secundario
                    aoPressionar={function retomar() { router.push('/treinos/executar'); }}
                />
                {ativo && <Text style={estilos.descricao}>Há um treino em andamento ou um registro pendente neste aparelho.</Text>}
                <Botao
                    titulo="Criar ou editar rotina pessoal"
                    aoPressionar={function editar() { router.push('/treinos/rotina'); }}
                />
                {rotinas && !rotinas.pessoal && !rotinas.recomendada && <Text style={estilos.descricao}>Você ainda não tem uma rotina. Crie a sua ou peça ao instrutor uma ficha.</Text>}
                {rotinas && (rotinas.pessoal || rotinas.recomendada) && <Text style={estilos.subtitulo}>Escolha a rotina e a divisão de hoje</Text>}
                {!confirmada && <Text style={estilos.descricao}>Você pode consultar e preparar sua rotina agora. Para iniciar o treino, peça a confirmação da chegada na recepção e toque em Atualizar.</Text>}
                {rotinas && (
                    <ResumoRotina
                        rotina={rotinas.recomendada}
                        aoIniciar={iniciar}
                        bloqueado={ocupado || ativo || !confirmada}
                    />
                )}
                {rotinas && (
                    <ResumoRotina
                        rotina={rotinas.pessoal}
                        aoIniciar={iniciar}
                        bloqueado={ocupado || ativo || !confirmada}
                    />
                )}
                {equipe && (
                    <Botao
                        titulo="Área da equipe"
                        secundario
                        aoPressionar={function abrirEquipe() { router.push('/equipe'); }}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
