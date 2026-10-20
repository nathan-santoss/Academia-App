import { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import Botao from '../components/Botao';
import EstadoConsulta from '../components/EstadoConsulta';
import CampoSelecao from '../components/CampoSelecao';
import EditorRotina from '../components/EditorRotina';
import ListaModelos from '../components/ListaModelos';
import TelaFormulario from '../components/TelaFormulario';
import useConsulta from '../hooks/useConsulta';
import { salvarModelo } from '../services/ficha-servico';
import { novaDivisao, prepararRotina } from '../utils/editar-rotina';
import { estilos } from '../theme/tema';

export default function ModelosTreino() {
    const papeis = useConsulta('/equipe/papeis');
    const [modelo, definirModelo] = useState(null);
    const [oficial, definirOficial] = useState('Privado');
    const [mensagem, definirMensagem] = useState('');
    const [ocupado, definirOcupado] = useState(false);
    const [atualizacao, definirAtualizacao] = useState(0);
    const trava = useRef(false);
    async function salvar(ativo = true) {
        if (trava.current) { return; }
        trava.current = true;
        definirOcupado(true);
        try {
            let publico = oficial === 'Oficial';
            if (!funcoes.includes('instrutor') && modelo.revisao === 0) { publico = true; }
            if (!funcoes.includes('administrador') && modelo.revisao === 0) { publico = false; }
            if (modelo.revisao > 0) { publico = modelo.oficial; }
            const salvo = await salvarModelo(modelo.id, {
                oficial: publico,
                ativo: ativo,
                revisao: modelo.revisao,
                conteudo: prepararRotina(modelo.conteudo),
            });
            definirModelo(null);
            definirAtualizacao(atualizacao + 1);
            definirMensagem('Modelo salvo. Revisão ' + salvo.revisao + '.');
        } catch (falha) { definirMensagem(falha.message + ' A edição permanece na tela; em caso de conflito, consulte o modelo atual.'); }
        finally { trava.current = false; definirOcupado(false); }
    }
    function novo() {
        definirModelo({
            id: randomUUID(),
            revisao: 0,
            oficial: false,
            conteudo: {
                nome: '',
                divisoes: [novaDivisao()],
            },
        });
        definirOficial('Privado');
    }
    const funcoes = papeis.dados || [];
    if (!funcoes.includes('instrutor') && !funcoes.includes('administrador')) {
        return (
            <TelaFormulario>
                <Text style={estilos.descricao}>{papeis.erro || 'Modelos exigem vínculo de instrutor ou administrador.'}</Text>
                <EstadoConsulta consulta={papeis} />
            </TelaFormulario>
        );
    }
    /** @type {'auto' | 'none'} */
    let eventos = 'auto';
    if (ocupado) { eventos = 'none'; }
    return (
        <TelaFormulario>
            <Text style={estilos.titulo}>Biblioteca de modelos</Text>
            <Text style={estilos.descricao}>Modelos são pontos de partida. Cada ficha precisa ser revisada para o aluno antes da publicação.</Text>
            {Boolean(mensagem) && (
                <Text
                    accessibilityLiveRegion="polite"
                    style={estilos.descricao}
                >{mensagem}</Text>
            )}
            {!modelo && (
                <Botao
                    titulo="Criar modelo"
                    aoPressionar={novo}
                />
            )}
            {!modelo && (
                <ListaModelos
                    key={atualizacao}
                    aoSelecionar={function escolher(item) {
                        definirModelo(JSON.parse(JSON.stringify(item)));
                        let tipo = 'Privado';
                        if (item.oficial) { tipo = 'Oficial'; }
                        definirOficial(tipo);
                        definirMensagem('Somente o autor pode editar ou arquivar este modelo. Você também pode criar uma cópia.');
                    }}
                />
            )}
            {modelo && (
                <View
                    style={estilos.grupo}
                    pointerEvents={eventos}
                >
                    {modelo.revisao === 0 && funcoes.includes('instrutor') && funcoes.includes('administrador') && (
                        <CampoSelecao
                            rotulo="Visibilidade"
                            valor={oficial}
                            opcoes={['Privado', 'Oficial']}
                            aoAlterar={definirOficial}
                        />
                    )}
                    <EditorRotina
                        rotina={modelo.conteudo}
                        aoAlterar={function editar(conteudo) { definirModelo(Object.assign({}, modelo, {
                            conteudo: conteudo,
                        })); }}
                    />
                    <Botao
                        titulo="Salvar modelo"
                        desabilitado={ocupado}
                        aoPressionar={function confirmarTipo() {
                            if (!funcoes.includes('instrutor') && modelo.revisao === 0) { definirOficial('Oficial'); }
                            salvar(true);
                        }}
                    />
                    {modelo.revisao > 0 && (
                        <Botao
                            titulo="Criar cópia independente"
                            secundario
                            aoPressionar={function copiar() {
                                definirModelo(Object.assign({}, modelo, {
                                    id: randomUUID(),
                                    revisao: 0,
                                }));
                                if (!funcoes.includes('administrador')) { definirOficial('Privado'); }
                                definirMensagem('Cópia preparada. Confira a visibilidade e salve.');
                            }}
                        />
                    )}
                    {modelo.revisao > 0 && (
                        <Botao
                            titulo="Arquivar modelo"
                            secundario
                            aoPressionar={function confirmar() {
                                Alert.alert('Arquivar modelo?', 'As fichas já criadas serão preservadas.', [
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
                        titulo="Voltar à lista"
                        secundario
                        aoPressionar={function confirmar() {
                            Alert.alert('Fechar edição?', 'Alterações não salvas serão descartadas.', [
                                {
                                    text: 'Continuar editando',
                                    style: 'cancel',
                                },
                                {
                                    text: 'Descartar',
                                    style: 'destructive',
                                    onPress: function fechar() { definirModelo(null); },
                                },
                            ]);
                        }}
                    />
                </View>
            )}
        </TelaFormulario>
    );
}
