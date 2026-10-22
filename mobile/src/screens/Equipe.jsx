import { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';
import TelaFormulario from '../components/TelaFormulario';
import Botao from '../components/Botao';
import Campo from '../components/Campo';
import CampoSelecao from '../components/CampoSelecao';
import FichaAluno from '../components/FichaAluno';
import PagamentosAluno from '../components/PagamentosAluno';
import BeneficiosAluno from '../components/BeneficiosAluno';
import FilaChegadas from '../components/FilaChegadas';
import EstadoConsulta from '../components/EstadoConsulta';
import useConsulta from '../hooks/useConsulta';
import * as servico from '../services/equipe-servico';
import { estilos } from '../theme/tema';

export default function Equipe() {
    const consulta = useConsulta('/equipe/papeis');
    const papeis = consulta.dados || [];
    const [busca, definirBusca] = useState('');
    const [alunos, definirAlunos] = useState([]);
    const [aluno, definirAluno] = useState(null);
    const [area, definirArea] = useState('');
    const [fila, definirFila] = useState(false);
    const [motivo, definirMotivo] = useState('');
    const [mensagem, definirMensagem] = useState('');
    const [ocupado, definirOcupado] = useState(false);
    const trava = useRef(false);
    const areas = [];
    if (papeis.includes('recepcao') || papeis.includes('gestao')) { areas.push('Entrada', 'Financeiro'); }
    if (papeis.includes('instrutor')) { areas.push('Ficha de treino'); }
    if (papeis.includes('gestao')) { areas.push('Benefícios'); }
    async function executar(acao) {
        if (trava.current) { return; }
        trava.current = true; definirOcupado(true);
        try { await acao(); }
        catch (falha) { definirMensagem(falha.message); }
        finally { trava.current = false; definirOcupado(false); }
    }
    function selecionar(item) {
        definirAluno(item); definirArea(areas[0] || ''); definirMotivo(''); definirMensagem(''); definirFila(false);
    }
    function buscar() {
        executar(async function consultar() {
            definirAlunos(await servico.buscarAlunos(busca.trim()));
            definirMensagem('Selecione e confira o aluno.');
        });
    }
    function confirmar(acao) {
        let texto = 'Confirme que ' + aluno.nome + ' · ' + aluno.matricula + ' está presencialmente na academia.';
        if (acao === 'excecao') { texto = 'Autorizar somente hoje: ' + aluno.nome + ' · ' + aluno.matricula + '? Motivo: ' + motivo; }
        const selecionado = aluno;
        const justificativa = motivo;
        Alert.alert('Conferir aluno', texto, [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Confirmar',
                onPress: function agir() {
                    executar(async function enviar() {
                        const resultado = await servico.enviarAcao(selecionado.id, acao, {
                            motivo: justificativa,
                        });
                        let aviso = 'Exceção autorizada. A recepção ainda precisa confirmar a presença.';
                        if (resultado.confirmadaEm) { aviso = 'Presença confirmada. O aluno pode iniciar o treino oficial.'; }
                        definirMensagem(aviso);
                    });
                },
            },
        ]);
    }
    function conferirChegada() {
        executar(async function consultar() {
            const chegada = await servico.consultarChegadaAluno(aluno.id);
            let texto = 'Ainda não há solicitação. Você pode confirmar uma chegada presencial após conferir o aluno.';
            if (chegada) {
                texto = 'Chegada aguardando confirmação presencial.';
                if (chegada.autorizadaEm) { texto += ' Exceção autorizada: ' + chegada.motivo; }
                if (chegada.confirmadaEm) { texto = 'Presença confirmada em ' + new Date(chegada.confirmadaEm).toLocaleTimeString('pt-BR'); }
            }
            definirMensagem(texto);
        });
    }
    return (
        <TelaFormulario>
            <Text style={estilos.titulo}>Área da equipe</Text>
            <EstadoConsulta consulta={consulta} />
            <Text style={estilos.descricao}>{'Funções ativas: ' + papeis.join(', ')}</Text>
            {(papeis.includes('gestao') || papeis.includes('administrador')) && (
                <Botao
                    titulo="Gerenciar vínculos da equipe"
                    secundario
                    aoPressionar={function abrir() { router.push('/funcionarios'); }}
                />
            )}
            {papeis.includes('gestao') && (
                <Botao
                    titulo="Planos e modalidades"
                    secundario
                    aoPressionar={function abrir() { router.push('/catalogo'); }}
                />
            )}
            {(papeis.includes('instrutor') || papeis.includes('administrador')) && (
                <View style={estilos.grupo}>
                    <Botao
                        titulo="Modelos de treino"
                        secundario
                        aoPressionar={function abrir() { router.push('/modelos'); }}
                    />
                    <Botao
                        titulo="Catálogo de exercícios"
                        secundario
                        aoPressionar={function abrir() { router.push('/exercicios'); }}
                    />
                </View>
            )}
            {papeis.includes('recepcao') && (
                <Botao
                    titulo="Ver fila de chegadas"
                    secundario
                    aoPressionar={function abrir() { definirFila(!fila); }}
                />
            )}
            {fila && papeis.includes('recepcao') && (
                <FilaChegadas aoSelecionar={selecionar} />
            )}
            {areas.length > 0 && (
                <View style={estilos.grupo}>
                    <Campo
                        rotulo="Buscar aluno por nome ou matrícula"
                        value={busca}
                        onChangeText={definirBusca}
                        maxLength={100}
                        editable={!ocupado}
                    />
                    <Botao
                        titulo="Buscar alunos"
                        desabilitado={ocupado || busca.trim().length < 2}
                        aoPressionar={buscar}
                    />
                    {alunos.map(function mostrar(item) {
                        return (
                            <Botao
                                key={item.id}
                                titulo={item.nome + ' · ' + item.matricula}
                                secundario
                                desabilitado={ocupado}
                                aoPressionar={function escolher() { selecionar(item); }}
                            />
                        );
                    })}
                </View>
            )}
            <Text
                accessibilityLiveRegion="polite"
                style={estilos.descricao}
            >{mensagem}</Text>
            {aluno && areas.length > 0 && (
                <View style={estilos.grupo}>
                    <Text style={estilos.subtitulo}>{aluno.nome + ' · ' + aluno.matricula}</Text>
                    <CampoSelecao
                        rotulo="Atendimento"
                        valor={area}
                        opcoes={areas}
                        aoAlterar={definirArea}
                    />
                    {area === 'Entrada' && (
                        <View style={estilos.cartao}>
                            {papeis.includes('recepcao') && (
                                <View style={estilos.grupo}>
                                    <Botao
                                        titulo="Consultar chegada de hoje"
                                        secundario
                                        desabilitado={ocupado}
                                        aoPressionar={conferirChegada}
                                    />
                                    <Botao
                                        titulo="Confirmar presença"
                                        desabilitado={ocupado}
                                        aoPressionar={function confirmarPresenca() { confirmar('chegada'); }}
                                    />
                                </View>
                            )}
                            {papeis.includes('gestao') && (
                                <View style={estilos.grupo}>
                                    <Campo
                                        rotulo="Motivo da exceção diária"
                                        value={motivo}
                                        onChangeText={definirMotivo}
                                        maxLength={500}
                                        editable={!ocupado}
                                    />
                                    <Botao
                                        titulo="Autorizar exceção para hoje"
                                        desabilitado={ocupado || !motivo.trim()}
                                        aoPressionar={function autorizar() { confirmar('excecao'); }}
                                    />
                                </View>
                            )}
                        </View>
                    )}
                    {area === 'Financeiro' && (papeis.includes('recepcao') || papeis.includes('gestao')) && (
                        <PagamentosAluno
                            key={'pagamento-' + aluno.id}
                            alunoId={aluno.id}
                            nome={aluno.nome + ' · ' + aluno.matricula}
                            podeGerir
                        />
                    )}
                    {area === 'Benefícios' && papeis.includes('gestao') && (
                        <BeneficiosAluno
                            key={'beneficio-' + aluno.id}
                            alunoId={aluno.id}
                            nome={aluno.nome + ' · ' + aluno.matricula}
                            podeGerir
                        />
                    )}
                    {area === 'Ficha de treino' && papeis.includes('instrutor') && (
                        <FichaAluno
                            key={aluno.id}
                            aluno={aluno}
                        />
                    )}
                </View>
            )}
        </TelaFormulario>
    );
}
