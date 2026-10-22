// Mostro a divisão escolhida e deixo o aluno registrar, corrigir ou desmarcar cada série.
// Uso o mesmo treino nos modos guiado e lista; o hook cuida de guardar e sincronizar os registros.
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import TelaFormulario from '../components/TelaFormulario';
import { useAcesso } from '../contexts/AcessoContext';
import useTreino from '../hooks/useTreino';
import Botao from '../components/Botao';
import SerieTreino from '../components/SerieTreino';
import DescansoTreino from '../components/DescansoTreino';
import { estilos } from '../theme/tema';

export default function ExecutarTreino() {
    const { usuario } = useAcesso();
    const estado = useTreino(usuario.id);
    const [guiado, definirGuiado] = useState(true);
    const [indice, definirIndice] = useState(0);
    const rascunho = estado.rascunho;

    function registrar(exercicio, serie) {
        const restantes = rascunho.treino.series.filter(function manter(item) {
            return item.exercicioId !== serie.exercicioId || item.numero !== serie.numero;
        });
        estado.registrar(restantes.concat(serie), false, exercicio.descanso);
    }

    function mostrarExercicio(exercicio) {
        let meta = exercicio.meta + ' repetições';
        if (exercicio.tipo === 'duracao') { meta = exercicio.meta + ' segundos'; }
        let carga = 'Sem carga sugerida';
        if (exercicio.carga !== null) { carga = exercicio.carga + ' kg — ' + exercicio.referenciaCarga; }
        return (
            <View
                key={exercicio.id}
                style={estilos.grupo}
            >
                <Text style={estilos.subtitulo}>{exercicio.nome}</Text>
                <Text style={estilos.descricao}>{exercicio.equipamento + ' • Referência: ' + exercicio.series + ' × ' + meta + ' • ' + carga}</Text>
                <Text style={estilos.descricao}>{exercicio.observacoes}</Text>
                {Array.from({
                    length: exercicio.series,
                }, function mostrarSerie(_valor, posicao) {
                    const numero = posicao + 1;
                    const serie = rascunho.treino.series.find(function encontrar(item) { return item.exercicioId === exercicio.id && item.numero === numero; });
                    let chaveSerie = String(numero);
                    if (serie) { chaveSerie += ':' + serie.carga + ':' + serie.realizado; }
                    return (
                        <SerieTreino
                            key={chaveSerie}
                            exercicio={exercicio}
                            numero={numero}
                            serie={serie}
                            bloqueado={estado.ocupado || estado.temConflito || Boolean(rascunho.encerrarPendente)}
                            aoSalvar={function salvar(dados) { registrar(exercicio, dados); }}
                            aoDesmarcar={function desmarcar() {
                                const restantes = rascunho.treino.series.filter(function manter(item) { return item.exercicioId !== exercicio.id || item.numero !== numero; });
                                estado.registrar(restantes, false, null);
                            }}
                        />
                    );
                })}
            </View>
        );
    }

    function encerrar() {
        Alert.alert('Encerrar treino?', 'Somente as séries marcadas serão registradas. Se faltarem séries, o treino será parcial.', [
            {
                text: 'Continuar treinando',
                style: 'cancel',
            },
            {
                text: 'Encerrar',
                onPress: function confirmar() { estado.registrar(rascunho.treino.series, true, 0); },
            },
        ]);
    }

    let conteudo = null;
    if (rascunho) {
        const treino = rascunho.treino;
        let exercicios = treino.referencia.divisao.exercicios;
        let modo = 'Mostrar modo guiado';
        if (guiado) { exercicios = exercicios.slice(indice, indice + 1); modo = 'Mostrar lista completa'; }
        let sincronizacao = 'Confirmado pela academia';
        if (rascunho.pendente) { sincronizacao = 'Alterações pendentes neste aparelho'; }
        conteudo = (
            <View style={estilos.grupo}>
                <Text style={estilos.titulo}>{treino.referencia.nome + ' • ' + treino.referencia.divisao.nome}</Text>
                <Text style={estilos.descricao}>{treino.referencia.origem + ' • versão ' + treino.referencia.versao}</Text>
                <Text style={estilos.etiqueta}>{sincronizacao}</Text>
                {treino.referencia.modo === 'demonstracao' && (
                    <Text style={estilos.etiqueta}>Treino demonstrativo • sem presença oficial</Text>
                )}
                <Botao
                    titulo={modo}
                    secundario
                    aoPressionar={function alternar() { definirGuiado(!guiado); }}
                />
                <DescansoTreino
                    ate={rascunho.descansoAte}
                    aoAlterar={estado.alterarDescanso}
                    bloqueado={estado.ocupado}
                />
                {exercicios.map(mostrarExercicio)}
                {guiado && (
                    <View style={estilos.grupo}>
                        <Botao
                            titulo="Exercício anterior"
                            secundario
                            desabilitado={indice === 0}
                            aoPressionar={function anterior() { definirIndice(indice - 1); }}
                        />
                        <Botao
                            titulo="Próximo exercício"
                            secundario
                            desabilitado={indice >= treino.referencia.divisao.exercicios.length - 1}
                            aoPressionar={function proximo() { definirIndice(indice + 1); }}
                        />
                    </View>
                )}
                <Botao
                    titulo="Sincronizar agora"
                    secundario
                    desabilitado={estado.ocupado}
                    aoPressionar={estado.sincronizar}
                />
                <Botao
                    titulo="Encerrar treino"
                    desabilitado={estado.ocupado || estado.temConflito || Boolean(rascunho.encerrarPendente)}
                    aoPressionar={encerrar}
                />
            </View>
        );
    }

    return (
        <TelaFormulario>
            <Text
                accessibilityLiveRegion="polite"
                style={estilos.descricao}
            >{estado.mensagem}</Text>
            {estado.temConflito && (
                <Botao
                    titulo="Resolver divergência com o servidor"
                    secundario
                    desabilitado={estado.ocupado}
                    aoPressionar={function confirmar() {
                        Alert.alert('Recuperar séries confirmadas?', 'As alterações locais não confirmadas serão descartadas. Confira seu registro antes de prosseguir.', [
                            {
                                text: 'Manter edição local',
                                style: 'cancel',
                            },
                            {
                                text: 'Usar versão do servidor',
                                style: 'destructive',
                                onPress: estado.recuperarConfirmado,
                            },
                        ]);
                    }}
                />
            )}
            {conteudo}
            {!rascunho && estado.falhaRecuperacao && (
                <Botao
                    titulo="Tentar recuperar treino novamente"
                    desabilitado={estado.ocupado}
                    aoPressionar={estado.recuperarNovamente}
                />
            )}
            {!rascunho && !estado.ocupado && !estado.falhaRecuperacao && (
                <Text style={estilos.texto}>Nenhum treino ativo neste aparelho. Volte a Treinos para escolher uma divisão.</Text>
            )}
        </TelaFormulario>
    );
}
