import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Botao from '../components/Botao';
import Campo from '../components/Campo';
import FichaAluno from '../components/FichaAluno';
import * as servico from '../services/equipe-servico';
import { estilos } from '../theme/tema';

export default function Equipe() {
    const [papeis, definirPapeis] = useState([]);
    const [busca, definirBusca] = useState('');
    const [alunos, definirAlunos] = useState([]);
    const [aluno, definirAluno] = useState(null);
    const [motivo, definirMotivo] = useState('');
    const [mensagem, definirMensagem] = useState('');
    const [ocupado, definirOcupado] = useState(false);
    useEffect(function carregar() {
        servico.consultarPapeis().then(definirPapeis).catch(function falhou(falha) { definirMensagem(falha.message); });
    }, []);

    async function buscar() {
        definirOcupado(true);
        try { definirAlunos(await servico.buscarAlunos(busca)); definirMensagem('Selecione e confira o aluno.'); }
        catch (falha) { definirMensagem(falha.message); }
        finally { definirOcupado(false); }
    }

    async function executar(acao) {
        definirOcupado(true);
        try {
            const resultado = await servico.enviarAcao(aluno.id, acao, {
                motivo: motivo,
            });
            let texto = 'Exceção autorizada para hoje. A recepção ainda precisa confirmar a presença.';
            if (resultado.confirmadaEm) { texto = 'Chegada confirmada. O aluno pode iniciar o treino.'; }
            definirMensagem(texto);
        } catch (falha) { definirMensagem(falha.message); }
        finally { definirOcupado(false); }
    }

    async function conferirChegada() {
        definirOcupado(true);
        try {
            const chegada = await servico.consultarChegadaAluno(aluno.id);
            let texto = 'Nenhuma solicitação ou autorização para hoje.';
            if (chegada) {
                texto = 'Solicitação aguardando autorização da Gestão.';
                if (chegada.autorizadaEm) { texto = 'Exceção autorizada. Motivo: ' + chegada.motivo; }
                if (chegada.confirmadaEm) { texto += ' Presença já confirmada.'; }
            }
            definirMensagem(texto);
        } catch (falha) { definirMensagem(falha.message); }
        finally { definirOcupado(false); }
    }

    function confirmar(acao) {
        let texto = 'Confirme que ' + aluno.nome + ' (' + aluno.matricula + ') está presencialmente na academia.';
        if (acao === 'excecao') { texto = 'Autorizar entrada somente hoje para ' + aluno.nome + ' (' + aluno.matricula + ')? Motivo: ' + motivo; }
        Alert.alert('Conferir aluno', texto, [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Confirmar',
                onPress: function agir() { executar(acao); },
            },
        ]);
    }

    const podeBuscar = papeis.some(function autorizado(papel) {
        return ['gestao', 'recepcao', 'instrutor'].includes(papel);
    });

    return (
        <SafeAreaView
            style={estilos.tela}
            edges={['bottom', 'left', 'right']}
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={estilos.conteudo}
            >
                <Text style={estilos.titulo}>Área da equipe</Text>
                <Text style={estilos.descricao}>{'Funções ativas: ' + papeis.join(', ')}</Text>
                {papeis.includes('administrador') && <Text style={estilos.descricao}>Seu vínculo de Administrador está ativo. A concessão de papéis e o painel administrativo ainda não estão disponíveis. As ações operacionais exigem seus papéis específicos.</Text>}
                <Campo
                    rotulo="Buscar aluno por nome ou matrícula"
                    value={busca}
                    onChangeText={definirBusca}
                />
                <Botao
                    titulo="Buscar alunos"
                    desabilitado={ocupado || !podeBuscar}
                    aoPressionar={buscar}
                />
                {alunos.map(function mostrar(item) {
                    return (
                        <Botao
                            key={item.id}
                            titulo={item.nome + ' • ' + item.matricula}
                            secundario
                            desabilitado={ocupado}
                            aoPressionar={function selecionar() {
                                definirAluno(item); definirMotivo(''); definirMensagem('');
                            }}
                        />
                    );
                })}
                <Text
                    accessibilityLiveRegion="polite"
                    style={estilos.descricao}
                >{mensagem}</Text>
                {aluno && (
                    <View style={estilos.grupo}>
                        <Text style={estilos.titulo}>{aluno.nome}</Text>
                        <Text style={estilos.etiqueta}>{aluno.matricula}</Text>
                        {papeis.includes('gestao') && (
                            <View style={estilos.cartao}>
                                <Text style={estilos.subtitulo}>Exceção diária de entrada</Text>
                                <Text style={estilos.descricao}>Autoriza a entrada de hoje. Não cria assinatura nem confirma pagamento.</Text>
                                <Campo
                                    rotulo="Motivo da autorização"
                                    value={motivo}
                                    onChangeText={definirMotivo}
                                    maxLength={500}
                                />
                                <Botao
                                    titulo="Autorizar exceção para hoje"
                                    desabilitado={ocupado || !motivo.trim()}
                                    aoPressionar={function autorizar() { confirmar('excecao'); }}
                                />
                            </View>
                        )}
                        {papeis.includes('recepcao') && (
                            <View style={estilos.cartao}>
                                <Botao
                                    titulo="Consultar chegada e autorização"
                                    secundario
                                    desabilitado={ocupado}
                                    aoPressionar={conferirChegada}
                                />
                                <Botao
                                    titulo="Confirmar presença na academia"
                                    desabilitado={ocupado}
                                    aoPressionar={function confirmarPresenca() { confirmar('chegada'); }}
                                />
                            </View>
                        )}
                        {papeis.includes('instrutor') && (
                            <FichaAluno
                                key={aluno.id}
                                aluno={aluno}
                            />
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
