import { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { useAcesso } from '../contexts/AcessoContext';
import Botao from '../components/Botao';
import CampoSelecao from '../components/CampoSelecao';
import ResumoRotina from '../components/ResumoRotina';
import TelaFormulario from '../components/TelaFormulario';
import * as servico from '../services/treino-servico';
import { consultarPapeis } from '../services/equipe-servico';
import { lerRascunho, guardarRascunho, apagarRascunho } from '../services/rascunho-treino-servico';
import { destinos } from '../navigation/destinos';
import { estilos } from '../theme/tema';

export default function Treinos() {
    const { usuario } = useAcesso();
    const [rotinas, definirRotinas] = useState(null);
    const [demonstracao, definirDemonstracao] = useState(false);
    const [modo, definirModo] = useState('Treino oficial');
    const [chegada, definirChegada] = useState(null);
    const [ativo, definirAtivo] = useState(false);
    const [equipe, definirEquipe] = useState(false);
    const [ocupado, definirOcupado] = useState(true);
    const [mensagem, definirMensagem] = useState('');
    const [atualizacao, definirAtualizacao] = useState(0);
    const trava = useRef(false);
    useFocusEffect(useCallback(function carregar() {
        let visivel = true;
        definirOcupado(true);
        async function consultar() {
            try {
                const local = await lerRascunho(usuario.id, 'treino');
                if (visivel && local) { definirAtivo(true); }
                const resultados = await Promise.all([
                    servico.consultarRotinas(),
                    servico.consultarTreinoAtivo(),
                    servico.consultarChegada(),
                ]);
                if (!visivel) { return; }
                definirRotinas(resultados[0]);
                definirAtivo(Boolean(local || resultados[1]));
                definirChegada(resultados[2]);
                definirMensagem('');
            } catch (falha) {
                if (visivel) { definirMensagem(falha.message); }
            } finally {
                if (visivel) { definirOcupado(false); }
            }
        }
        consultar();
        servico.consultarConfiguracao().then(function recebeu(dados) {
            if (visivel) { definirDemonstracao(dados.demonstracaoHabilitada === true); }
        }).catch(function indisponivel() { if (visivel) { definirDemonstracao(false); } });
        consultarPapeis().then(function recebeu(papeis) {
            if (visivel) { definirEquipe(papeis.length > 0); }
        }).catch(function indisponivel() { if (visivel) { definirEquipe(false); } });
        return function sair() { visivel = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Atualizo após solicitação de chegada e retorno à tela.
    }, [usuario.id, atualizacao]));

    async function solicitar() {
        if (trava.current) { return; }
        trava.current = true;
        definirOcupado(true);
        try {
            definirChegada(await servico.solicitarChegada());
            definirMensagem('Solicitação enviada. Aguarde a conferência presencial da recepção e toque em Atualizar.');
        } catch (falha) { definirMensagem(falha.message); }
        finally { trava.current = false; definirOcupado(false); }
    }

    async function iniciar(rotina, divisao) {
        if (trava.current || ocupado || ativo) { return; }
        trava.current = true;
        definirOcupado(true);
        try {
            // Recupero o mesmo pedido após perda de resposta; nunca crio duas sessões por repetir o toque.
            let pedido = await lerRascunho(usuario.id, 'inicio-treino');
            if (pedido && (pedido.dados.rotinaId !== rotina.id || pedido.dados.divisaoId !== divisao.id || pedido.modo !== modo)) {
                throw new Error('Há um início sem confirmação. Use Retomar treino ou repita a mesma divisão e modalidade de início.');
            }
            if (!pedido) {
                pedido = {
                    modo: modo,
                    dados: {
                        id: randomUUID(),
                        rotinaId: rotina.id,
                        origem: rotina.origem,
                        divisaoId: divisao.id,
                    },
                };
                await guardarRascunho(usuario.id, 'inicio-treino', pedido);
            }
            let treino;
            try {
                if (pedido.modo === 'Demonstração') { treino = await servico.iniciarDemonstracao(pedido.dados); }
                else { treino = await servico.iniciarTreino(pedido.dados); }
            } catch (falha) {
                if (falha.status >= 400 && falha.status < 500) { await apagarRascunho(usuario.id, 'inicio-treino'); }
                throw falha;
            }
            definirAtivo(true);
            await guardarRascunho(usuario.id, 'treino', {
                treino: treino,
                pendente: null,
                descansoAte: 0,
            });
            await apagarRascunho(usuario.id, 'inicio-treino');
            router.push(destinos.executar);
        } catch (falha) {
            definirMensagem(falha.message + ' Se não recebeu confirmação, consulte Retomar treino.');
        } finally { trava.current = false; definirOcupado(false); }
    }

    let confirmado = false;
    if (chegada && chegada.confirmadaEm) { confirmado = true; }
    let bloqueado = ocupado || ativo || !confirmado;
    const demonstrativo = modo === 'Demonstração';
    if (demonstrativo) { bloqueado = ocupado || ativo || !demonstracao; }
    return (
        <TelaFormulario>
            <Text style={estilos.etiqueta}>SEU TREINO</Text>
            <Text style={estilos.titulo}>{'Olá, ' + usuario.nome}</Text>
            <View style={estilos.cartao}>
                <Text style={estilos.subtitulo}>Chegada de hoje</Text>
                {!chegada && (
                    <Text style={estilos.descricao}>Ao chegar à academia, avise a recepção e solicite sua entrada.</Text>
                )}
                {chegada && !confirmado && (
                    <Text style={estilos.descricao}>Aguardando confirmação presencial da recepção.</Text>
                )}
                {confirmado && (
                    <Text style={estilos.sucesso}>Presença confirmada. Escolha sua divisão para treinar.</Text>
                )}
                <Botao
                    titulo="Solicitar chegada"
                    desabilitado={ocupado || Boolean(chegada)}
                    aoPressionar={solicitar}
                />
                <Botao
                    titulo="Atualizar"
                    secundario
                    desabilitado={ocupado}
                    aoPressionar={function atualizar() { definirAtualizacao(atualizacao + 1); }}
                />
            </View>
            {Boolean(mensagem) && (
                <Text
                    accessibilityLiveRegion="polite"
                    style={estilos.descricao}
                >{mensagem}</Text>
            )}
            <Botao
                titulo="Retomar treino / conferir início"
                secundario
                aoPressionar={function retomar() { router.push(destinos.executar); }}
            />
            {ativo && (
                <Text style={estilos.descricao}>Há um treino em andamento ou registro pendente neste aparelho.</Text>
            )}
            <Botao
                titulo="Criar ou editar rotina pessoal"
                aoPressionar={function editar() { router.push(destinos.rotina); }}
            />
            {demonstracao && (
                <CampoSelecao
                    rotulo="Modo de treino"
                    valor={modo}
                    opcoes={['Treino oficial', 'Demonstração']}
                    aoAlterar={definirModo}
                />
            )}
            {demonstrativo && (
                <Text style={estilos.descricao}>A demonstração usa somente sua rotina pessoal e não registra presença nem evolução oficial.</Text>
            )}
            {rotinas && !demonstrativo && (
                <ResumoRotina
                    rotina={rotinas.recomendada}
                    aoIniciar={iniciar}
                    bloqueado={bloqueado}
                />
            )}
            {rotinas && (
                <ResumoRotina
                    rotina={rotinas.pessoal}
                    aoIniciar={iniciar}
                    bloqueado={bloqueado}
                    demonstrativo={demonstrativo}
                />
            )}
            {rotinas && !rotinas.pessoal && !rotinas.recomendada && (
                <Text style={estilos.descricao}>Crie uma rotina pessoal ou peça sua ficha ao instrutor.</Text>
            )}
            <Botao
                titulo="Minha cobertura e pagamentos"
                secundario
                aoPressionar={function abrir() { router.push('/financeiro'); }}
            />
            <Botao
                titulo="Notificações da academia"
                secundario
                aoPressionar={function abrir() { router.push('/notificacoes'); }}
            />
            {equipe && (
                <Botao
                    titulo="Área da equipe"
                    secundario
                    aoPressionar={function abrir() { router.push(destinos.equipe); }}
                />
            )}
        </TelaFormulario>
    );
}
