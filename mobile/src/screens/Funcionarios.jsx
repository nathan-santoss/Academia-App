import { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import TelaFormulario from '../components/TelaFormulario';
import Botao from '../components/Botao';
import Campo from '../components/Campo';
import CampoSelecao from '../components/CampoSelecao';
import EstadoConsulta from '../components/EstadoConsulta';
import Paginacao from '../components/Paginacao';
import useConsulta from '../hooks/useConsulta';
import { solicitarApi } from '../services/api';
import { estilos } from '../theme/tema';

export default function Funcionarios() {
    const [pagina, definirPagina] = useState(0);
    const [busca, definirBusca] = useState('');
    const [filtro, definirFiltro] = useState('');
    const [selecionado, definirSelecionado] = useState(null);
    const [motivo, definirMotivo] = useState('');
    const [mensagem, definirMensagem] = useState('');
    const [ocupado, definirOcupado] = useState(false);
    const trava = useRef(false);
    const consulta = useConsulta('/funcionarios?pagina=' + pagina);
    const papeis = useConsulta('/equipe/papeis');
    let caminho = '';
    if (filtro) { caminho = '/funcionarios/contas?busca=' + encodeURIComponent(filtro); }
    const contas = useConsulta(caminho);
    const lista = consulta.dados || [];
    const resultados = contas.dados || [];
    let opcoes = ['recepcao', 'instrutor'];
    if (papeis.dados && papeis.dados.includes('administrador')) { opcoes = opcoes.concat(['gestao', 'administrador']); }
    async function salvar() {
        if (trava.current) { return; }
        trava.current = true; definirOcupado(true);
        try {
            await solicitarApi('/funcionarios/' + selecionado.contaId, {
                method: 'PUT',
                body: JSON.stringify({
                    ativo: selecionado.ativo,
                    papeis: selecionado.papeis,
                    motivo: motivo,
                }),
            });
            definirSelecionado(null); definirMotivo(''); consulta.atualizar(); contas.atualizar();
            definirMensagem('Vínculo atualizado.');
        } catch (falha) { definirMensagem(falha.message); }
        finally { trava.current = false; definirOcupado(false); }
    }
    function confirmar() {
        Alert.alert('Conferir vínculo funcional', selecionado.identidade.nome + ' · ' + selecionado.identidade.matricula + '. Papéis: ' + selecionado.papeis.join(', ') + '. Motivo: ' + motivo, [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Confirmar alteração',
                onPress: salvar,
            },
        ]);
    }
    return (
        <TelaFormulario>
            <Text style={estilos.titulo}>Vínculos da equipe</Text>
            <Text style={estilos.descricao}>Selecione uma conta existente e confira a identidade presencialmente. A criação de credenciais iniciais permanece indisponível.</Text>
            {Boolean(mensagem) && (
                <Text
                    accessibilityLiveRegion="polite"
                    style={estilos.descricao}
                >{mensagem}</Text>
            )}
            {!selecionado && (
                <View style={estilos.grupo}>
                    <Campo
                        rotulo="Buscar conta por nome ou matrícula de aluno"
                        value={busca}
                        onChangeText={definirBusca}
                        maxLength={100}
                    />
                    <Botao
                        titulo="Buscar conta existente"
                        desabilitado={busca.trim().length < 2 || contas.carregando}
                        aoPressionar={function buscar() { definirFiltro(busca.trim()); }}
                    />
                    {Boolean(filtro) && (
                        <EstadoConsulta consulta={contas} />
                    )}
                    {resultados.map(function mostrar(item) {
                        return (
                            <Botao
                                key={item.contaId}
                                titulo={item.nome + ' · ' + item.matricula}
                                secundario
                                aoPressionar={function escolher() {
                                    let vinculo = {
                                        contaId: item.contaId,
                                        papeis: [],
                                        ativo: true,
                                    };
                                    if (item.vinculo) { vinculo = item.vinculo; }
                                    definirSelecionado(Object.assign({}, vinculo, {
                                        identidade: item,
                                    })); definirMotivo('');
                                }}
                            />
                        );
                    })}
                    <EstadoConsulta consulta={consulta} />
                    {lista.map(function mostrar(item) {
                        if (!item.identidade) { return null; }
                        let situacao = 'Ativo';
                        if (!item.ativo) { situacao = 'Inativo'; }
                        return (
                            <View
                                key={item.contaId}
                                style={estilos.cartao}
                            >
                                <Text style={estilos.texto}>{item.identidade.nome + ' · F' + String(item.numeroMatricula).padStart(6, '0')}</Text>
                                <Text style={estilos.descricao}>{situacao + ' · ' + item.papeis.join(', ')}</Text>
                                <Botao
                                    titulo="Conferir vínculo"
                                    secundario
                                    aoPressionar={function editar() { definirSelecionado(item); definirMotivo(''); }}
                                />
                            </View>
                        );
                    })}
                    <Paginacao
                        pagina={pagina}
                        quantidade={lista.length}
                        ocupado={consulta.carregando}
                        aoAlterar={definirPagina}
                    />
                </View>
            )}
            {selecionado && (
                <View style={estilos.cartao}>
                    <Text style={estilos.subtitulo}>{selecionado.identidade.nome + ' · ' + selecionado.identidade.matricula}</Text>
                    <Text style={estilos.descricao}>{'Papéis selecionados: ' + selecionado.papeis.join(', ')}</Text>
                    {opcoes.map(function opcao(papel) {
                        let titulo = papel;
                        if (selecionado.papeis.includes(papel)) { titulo = '✓ ' + papel; }
                        return (
                            <Botao
                                key={papel}
                                titulo={titulo}
                                secundario
                                desabilitado={ocupado}
                                aoPressionar={function alternar() {
                                    let novos = selecionado.papeis.concat(papel);
                                    if (selecionado.papeis.includes(papel)) { novos = selecionado.papeis.filter(function manter(item) { return item !== papel; }); }
                                    definirSelecionado(Object.assign({}, selecionado, {
                                        papeis: novos,
                                    }));
                                }}
                            />
                        );
                    })}
                    <CampoSelecao
                        rotulo="Vínculo ativo"
                        valor={String(selecionado.ativo)}
                        opcoes={['true', 'false']}
                        aoAlterar={function ativo(valor) { definirSelecionado(Object.assign({}, selecionado, {
                            ativo: valor === 'true',
                        })); }}
                    />
                    <Campo
                        rotulo="Motivo e conferência da identidade"
                        value={motivo}
                        onChangeText={definirMotivo}
                        maxLength={500}
                        editable={!ocupado}
                    />
                    <Botao
                        titulo="Salvar vínculo"
                        desabilitado={ocupado || !motivo.trim() || !selecionado.papeis.length}
                        aoPressionar={confirmar}
                    />
                    <Botao
                        titulo="Voltar à lista"
                        secundario
                        desabilitado={ocupado}
                        aoPressionar={function voltar() { definirSelecionado(null); consulta.atualizar(); contas.atualizar(); }}
                    />
                </View>
            )}
        </TelaFormulario>
    );
}
