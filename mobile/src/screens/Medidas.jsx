import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import TelaFormulario from '../components/TelaFormulario';
import Botao from '../components/Botao';
import Campo from '../components/Campo';
import CampoSelecao from '../components/CampoSelecao';
import EstadoConsulta from '../components/EstadoConsulta';
import EnvioPendente from '../components/EnvioPendente';
import Paginacao from '../components/Paginacao';
import useConsulta from '../hooks/useConsulta';
import useGravacao from '../hooks/useGravacao';
import { dataDia, hojeAcademia } from '../utils/apresentar-dados';
import { estilos } from '../theme/tema';

export default function Medidas() {
    const [pagina, definirPagina] = useState(0);
    const consulta = useConsulta('/medidas?pagina=' + pagina);
    const privacidade = useConsulta('/medidas/privacidade');
    const gravacao = useGravacao('medidas');
    const [tipo, definirTipo] = useState('peso');
    const [valor, definirValor] = useState('');
    const [dia, definirDia] = useState(hojeAcademia());
    const [edicao, definirEdicao] = useState(null);
    const [motivo, definirMotivo] = useState('');
    const [erro, definirErro] = useState('');
    const medidas = consulta.dados || [];
    let rotulo = 'Peso em kg';
    if (tipo === 'altura') { rotulo = 'Altura em cm'; }
    function atualizar() { consulta.atualizar(); privacidade.atualizar(); }
    async function salvar() {
        const numero = Number(valor.replace(',', '.'));
        if (!valor.trim() || !Number.isFinite(numero) || numero <= 0) { definirErro('Informe uma medida válida.'); return; }
        if (edicao && !motivo.trim()) { definirErro('Informe o motivo da correção.'); return; }
        definirErro('');
        let caminho = '/medidas';
        let metodo = 'POST';
        const dados = {
            tipo: tipo,
            valor: numero,
            dia: dia,
        };
        if (edicao) {
            caminho += '/' + edicao.id;
            metodo = 'PUT';
            Object.assign(dados, {
                revisao: edicao.revisao,
                motivo: motivo,
            });
        }
        const resultado = await gravacao.enviar(caminho, metodo, dados);
        if (resultado) { definirValor(''); definirEdicao(null); definirMotivo(''); atualizar(); }
    }
    function compartilhar() {
        const escolha = !privacidade.dados.compartilharMedidas;
        let mensagem = 'Os instrutores poderão consultar suas medidas enquanto esta opção estiver ativa.';
        if (!escolha) { mensagem = 'Os instrutores deixarão de consultar suas medidas. Seus registros continuam privados na sua conta.'; }
        Alert.alert('Compartilhamento de medidas', mensagem, [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Confirmar',
                onPress: async function confirmar() {
                    const resultado = await gravacao.enviar('/medidas/privacidade', 'PUT', {
                        compartilharMedidas: escolha,
                    });
                    if (resultado) { privacidade.atualizar(); }
                },
            },
        ]);
    }
    let acaoPrivacidade = 'Compartilhar com instrutores';
    if (privacidade.dados && privacidade.dados.compartilharMedidas) { acaoPrivacidade = 'Parar de compartilhar'; }
    return (
        <TelaFormulario>
            <Text style={estilos.titulo}>Minhas medidas</Text>
            <Text style={estilos.descricao}>Registro opcional. Suas medidas são privadas por padrão.</Text>
            {Boolean(privacidade.erro) && (
                <Text style={estilos.erro}>{privacidade.erro}</Text>
            )}
            {privacidade.dados && (
                <Botao
                    titulo={acaoPrivacidade}
                    secundario
                    desabilitado={gravacao.ocupado}
                    aoPressionar={compartilhar}
                />
            )}
            <Text style={estilos.subtitulo}>Registrar ou corrigir medida</Text>
            {!edicao && (
                <CampoSelecao
                    rotulo="Tipo"
                    valor={tipo}
                    opcoes={['peso', 'altura']}
                    aoAlterar={definirTipo}
                />
            )}
            <Campo
                rotulo={rotulo}
                value={valor}
                keyboardType="decimal-pad"
                onChangeText={definirValor}
                editable={!gravacao.ocupado}
            />
            <Campo
                rotulo="Data (AAAA-MM-DD)"
                value={dia}
                onChangeText={definirDia}
                maxLength={10}
                editable={!gravacao.ocupado}
            />
            {edicao && (
                <Campo
                    rotulo="Motivo da correção"
                    value={motivo}
                    onChangeText={definirMotivo}
                    maxLength={500}
                    editable={!gravacao.ocupado}
                />
            )}
            {Boolean(erro) && (
                <Text style={estilos.erro}>{erro}</Text>
            )}
            <Botao
                titulo="Salvar medida"
                desabilitado={gravacao.ocupado}
                aoPressionar={salvar}
            />
            {edicao && (
                <Botao
                    titulo="Cancelar correção"
                    secundario
                    desabilitado={gravacao.ocupado}
                    aoPressionar={function cancelar() { definirEdicao(null); definirValor(''); definirMotivo(''); }}
                />
            )}
            <EnvioPendente
                gravacao={gravacao}
                aoConfirmar={atualizar}
            />
            <EstadoConsulta consulta={consulta} />
            {!consulta.carregando && !consulta.erro && medidas.length === 0 && (
                <Text style={estilos.descricao}>Nenhuma medida nesta página.</Text>
            )}
            {medidas.map(function mostrar(item) {
                let unidade = 'kg';
                if (item.tipo === 'altura') { unidade = 'cm'; }
                return (
                    <View
                        key={item.id}
                        style={estilos.cartao}
                    >
                        <Text style={estilos.texto}>{dataDia(item.dia) + ' · ' + item.valor + ' ' + unidade}</Text>
                        <Botao
                            titulo="Corrigir registro"
                            secundario
                            desabilitado={gravacao.ocupado}
                            aoPressionar={function corrigir() {
                                definirEdicao(item); definirTipo(item.tipo); definirValor(String(item.valor)); definirDia(item.dia); definirMotivo('');
                            }}
                        />
                    </View>
                );
            })}
            <Paginacao
                pagina={pagina}
                quantidade={medidas.length}
                ocupado={consulta.carregando || gravacao.ocupado}
                aoAlterar={definirPagina}
            />
        </TelaFormulario>
    );
}
