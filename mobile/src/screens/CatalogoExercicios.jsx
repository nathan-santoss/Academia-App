import { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import TelaFormulario from '../components/TelaFormulario';
import SelecionarExercicio from '../components/SelecionarExercicio';
import Campo from '../components/Campo';
import CampoSelecao from '../components/CampoSelecao';
import Botao from '../components/Botao';
import EstadoConsulta from '../components/EstadoConsulta';
import useConsulta from '../hooks/useConsulta';
import { solicitarApi } from '../services/api';
import { estilos } from '../theme/tema';

function editarCadastro(item) {
    let detalhes = {
        origem: 'oficial',
        revisao: 0,
        termosBusca: '',
        imagemUrl: '',
        videoUrl: '',
    };
    if (item.detalhes) { detalhes = item.detalhes; }
    return Object.assign({}, item, detalhes, {
        id: item.id,
        midiaRevisada: false,
    });
}

export default function CatalogoExercicios() {
    const papeis = useConsulta('/equipe/papeis');
    const [item, definirItem] = useState(null);
    const [buscando, definirBuscando] = useState(false);
    const [ocupado, definirOcupado] = useState(false);
    const [mensagem, definirMensagem] = useState('');
    const trava = useRef(false);
    const funcoes = papeis.dados || [];
    function editar(nome, valor) { definirItem(Object.assign({}, item, {
        [nome]: valor,
    })); }
    function criar() {
        let origem = 'local';
        if (!funcoes.includes('instrutor')) { origem = 'oficial'; }
        definirItem({
            id: randomUUID(),
            nome: '',
            grupoMuscular: '',
            equipamento: '',
            tipo: 'repeticoes',
            origem: origem,
            revisao: 0,
            ativo: true,
            descricao: '',
            termosBusca: '',
            imagemUrl: '',
            videoUrl: '',
            midiaRevisada: false,
        });
    }
    async function salvar(ativo) {
        if (trava.current) { return; }
        trava.current = true; definirOcupado(true);
        try {
            const resultado = await solicitarApi('/exercicios/' + item.id, {
                method: 'PUT',
                body: JSON.stringify(Object.assign({}, item, {
                    ativo: ativo,
                })),
            });
            definirMensagem('Catálogo atualizado.');
            if (ativo) { definirItem(editarCadastro(resultado)); }
            else { definirItem(null); }
        } catch (falha) { definirMensagem(falha.message + ' A edição permanece na tela. Em caso de conflito, consulte o exercício novamente.'); }
        finally { trava.current = false; definirOcupado(false); }
    }
    function campo(rotulo, nome, limite = 100) {
        return (
            <Campo
                rotulo={rotulo}
                value={item[nome] || ''}
                onChangeText={function alterar(valor) { editar(nome, valor); }}
                maxLength={limite}
                editable={!ocupado}
            />
        );
    }
    let origemEditavel = false;
    if (item && item.revisao === 0 && !item.codigo && funcoes.includes('instrutor') && funcoes.includes('administrador')) { origemEditavel = true; }
    if (!funcoes.includes('instrutor') && !funcoes.includes('administrador')) {
        return (
            <TelaFormulario>
                <Text style={estilos.descricao}>Catálogo profissional: acesso de instrutor ou administrador.</Text>

                <EstadoConsulta consulta={papeis} />
            </TelaFormulario>
        );
    }
    /** @type {'auto' | 'none'} */
    let eventos = 'auto';
    if (ocupado) { eventos = 'none'; }
    return (
        <TelaFormulario>
            <Text style={estilos.titulo}>Exercícios da academia</Text>
            {Boolean(mensagem) && (
                <Text
                    accessibilityLiveRegion="polite"
                    style={estilos.descricao}
                >{mensagem}</Text>
            )}
            {!item && (
                <Botao
                    titulo="Cadastrar exercício"
                    aoPressionar={criar}
                />
            )}
            {!item && (
                <Botao
                    titulo="Buscar exercício para editar"
                    secundario
                    aoPressionar={function buscar() { definirBuscando(true); }}
                />
            )}
            {!item && buscando && (
                <SelecionarExercicio
                    aoSelecionar={function selecionar(registro) { definirItem(editarCadastro(registro)); definirBuscando(false); }}
                    aoCancelar={function fechar() { definirBuscando(false); }}
                />
            )}
            {item && (
                <View
                    style={estilos.grupo}
                    pointerEvents={eventos}
                >
                    {campo('Nome e variação', 'nome')}
                    <CampoSelecao
                        rotulo="Grupo muscular"
                        valor={item.grupoMuscular}
                        opcoes={['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Abdômen', 'Cardio']}
                        permitirOutro
                        aoAlterar={function grupo(valor) { editar('grupoMuscular', valor); }}
                    />
                    <CampoSelecao
                        rotulo="Equipamento"
                        valor={item.equipamento}
                        opcoes={['Peso corporal', 'Halteres', 'Barra', 'Máquina', 'Polia', 'Elástico', 'Kettlebell']}
                        permitirOutro
                        aoAlterar={function equipamento(valor) { editar('equipamento', valor); }}
                    />
                    <CampoSelecao
                        rotulo="Tipo"
                        valor={item.tipo}
                        opcoes={['repeticoes', 'duracao']}
                        aoAlterar={function tipo(valor) { editar('tipo', valor); }}
                    />
                    {origemEditavel && (
                        <CampoSelecao
                            rotulo="Catálogo"
                            valor={item.origem}
                            opcoes={['local', 'oficial']}
                            aoAlterar={function origem(valor) { editar('origem', valor); }}
                        />
                    )}
                    {campo('Descrição (opcional)', 'descricao', 500)}
                    {campo('Outros nomes para busca (opcional)', 'termosBusca', 500)}
                    {campo('Link HTTPS da imagem (opcional)', 'imagemUrl', 2048)}
                    {campo('Link YouTube revisado (opcional)', 'videoUrl', 2048)}
                    {Boolean(item.videoUrl) && (
                        <CampoSelecao
                            rotulo="Revisei o conteúdo do vídeo"
                            valor={String(item.midiaRevisada)}
                            opcoes={['false', 'true']}
                            aoAlterar={function confirmar(valor) { editar('midiaRevisada', valor === 'true'); }}
                        />
                    )}
                    <Botao
                        titulo="Salvar exercício"
                        desabilitado={ocupado}
                        aoPressionar={function enviar() { salvar(true); }}
                    />
                    {item.codigo && (
                        <Botao
                            titulo="Arquivar exercício"
                            secundario
                            desabilitado={ocupado}
                            aoPressionar={function confirmar() {
                                Alert.alert('Arquivar exercício?', 'Novas buscas não mostrarão este exercício. Treinos anteriores serão preservados.', [
                                    {
                                        text: 'Cancelar',
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Arquivar',
                                        style: 'destructive',
                                        onPress: function arquivar() { salvar(false); },
                                    },
                                ]);
                            }}
                        />
                    )}
                    <Botao
                        titulo="Fechar edição"
                        secundario
                        desabilitado={ocupado}
                        aoPressionar={function confirmar() {
                            Alert.alert('Fechar edição?', 'Alterações não salvas serão descartadas.', [
                                {
                                    text: 'Continuar',
                                    style: 'cancel',
                                },
                                {
                                    text: 'Descartar',
                                    style: 'destructive',
                                    onPress: function fechar() { definirItem(null); },
                                },
                            ]);
                        }}
                    />
                </View>
            )}
        </TelaFormulario>
    );
}
