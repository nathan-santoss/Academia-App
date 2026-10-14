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
import { destinos } from '../navigation/destinos';
import { estilos } from '../theme/tema';

export default function Treinos() {
    const { usuario } = useAcesso();
    const [rotinas, definirRotinas] = useState(null);
    const [demonstracao, definirDemonstracao] = useState(false);
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
                const resultados = await Promise.all([servico.consultarRotinas(), servico.consultarConfiguracao(), servico.consultarTreinoAtivo()]);
                if (!visivel) { return; }
                definirRotinas(resultados[0]);
                definirDemonstracao(resultados[1].demonstracaoHabilitada === true);
                definirAtivo(Boolean(local || resultados[2]));
                definirMensagem('');
            } catch (falha) {
                if (visivel) { definirMensagem(falha.message); }
            } finally {
                if (visivel) { definirOcupado(false); }
            }
        }
        consultar();
        consultarPapeis().then(function recebeu(papeis) {
            if (visivel) { definirEquipe(papeis.length > 0); }
        }).catch(function indisponivel() {
            if (visivel) { definirEquipe(false); }
        });
        return function sair() { visivel = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Reconsulto ao tocar em Atualizar, além de retornar à tela.
    }, [usuario.id, atualizacao]));

    async function iniciar(rotina, divisao) {
        if (iniciando.current || ocupado || ativo) { return; }
        iniciando.current = true;
        definirOcupado(true);
        try {
            const treino = await servico.iniciarDemonstracao({
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
            router.push(destinos.executar);
        } catch (falha) {
            definirMensagem(falha.message + ' Se o início não recebeu resposta, use Retomar treino para consultar a sessão.');
        } finally {
            iniciando.current = false;
            definirOcupado(false);
        }
    }

    return (
        <SafeAreaView
            style={estilos.tela}
            edges={['bottom', 'left', 'right']}
        >
            <ScrollView contentContainerStyle={estilos.conteudo}>
                <Text style={estilos.etiqueta}>SEU TREINO</Text>
                <Text style={estilos.titulo}>{'Olá, ' + usuario.nome}</Text>
                <Text style={estilos.descricao}>Treino pessoal demonstrativo, sem plano ou confirmação de chegada. Não registra presença oficial nem substitui orientação profissional.</Text>
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
                <Botao
                    titulo="Retomar treino"
                    secundario
                    aoPressionar={function retomar() { router.push(destinos.executar); }}
                />
                {ativo && <Text style={estilos.descricao}>Há um treino em andamento ou um registro pendente neste aparelho.</Text>}
                <Botao
                    titulo="Criar ou editar rotina pessoal"
                    aoPressionar={function editar() { router.push(destinos.rotina); }}
                />
                {rotinas && !rotinas.pessoal && <Text style={estilos.descricao}>Você ainda não tem uma rotina. Crie a sua para começar.</Text>}
                {rotinas && rotinas.pessoal && <Text style={estilos.subtitulo}>Escolha a rotina e a divisão de hoje</Text>}
                {!demonstracao && <Text style={estilos.descricao}>O início demonstrativo está indisponível neste servidor. Você pode editar sua rotina, consultar o histórico e retomar sessões existentes.</Text>}
                {rotinas && (
                    <ResumoRotina
                        rotina={rotinas.pessoal}
                        aoIniciar={iniciar}
                        bloqueado={ocupado || ativo || !demonstracao}
                        demonstrativo
                    />
                )}
                {equipe && (
                    <Botao
                        titulo="Área da equipe"
                        secundario
                        aoPressionar={function abrirEquipe() { router.push(destinos.equipe); }}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
