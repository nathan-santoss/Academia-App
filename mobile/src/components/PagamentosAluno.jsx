import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Botao from './Botao';
import Campo from './Campo';
import CampoSelecao from './CampoSelecao';
import EstadoConsulta from './EstadoConsulta';
import EnvioPendente from './EnvioPendente';
import Paginacao from './Paginacao';
import SituacaoFinanceira from './SituacaoFinanceira';
import useConsulta from '../hooks/useConsulta';
import useGravacao from '../hooks/useGravacao';
import { moeda } from '../utils/apresentar-dados';
import { estilos } from '../theme/tema';

export default function PagamentosAluno({ alunoId = '', nome = '', podeGerir = false }) {
    const [pagina, definirPagina] = useState(0);
    const [planoId, definirPlanoId] = useState('');
    const [metodo, definirMetodo] = useState('pix');
    const [comprovante, definirComprovante] = useState('');
    let base = '/financeiro';
    if (alunoId) { base += '/alunos/' + alunoId; }
    const situacao = useConsulta(base + '/situacao');
    const pagamentos = useConsulta(base + '/pagamentos?pagina=' + pagina);
    let caminhoCatalogo = '';
    if (podeGerir) { caminhoCatalogo = '/catalogo/plano'; }
    const catalogo = useConsulta(caminhoCatalogo);
    const gravacao = useGravacao('financeiro-' + alunoId);
    let planos = [];
    if (catalogo.dados) { planos = catalogo.dados.dados.filter(function ativo(item) { return item.ativo; }); }
    const lista = pagamentos.dados || [];
    const plano = planos.find(function selecionado(item) { return item.id === planoId; });
    function atualizar() { situacao.atualizar(); pagamentos.atualizar(); catalogo.atualizar(); }
    async function registrar() {
        if (!plano) { return; }
        const resultado = await gravacao.enviar(base + '/pagamentos', 'POST', {
            planoId: plano.id,
            valorCentavos: plano.precoCentavos,
            metodo: metodo,
            comprovante: comprovante,
        });
        if (resultado) { definirComprovante(''); pagamentos.atualizar(); }
    }
    function confirmarPagamento(item) {
        Alert.alert('Confirmar recebimento?', nome + ' · ' + item.plano.nome + ' · ' + moeda(item.valorCentavos) + '. Confirme somente após conferir o recebimento real.', [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Recebimento conferido',
                onPress: async function confirmar() {
                    const resultado = await gravacao.enviar(base + '/pagamentos/' + item.id + '/confirmar', 'POST', {});
                    if (resultado) { atualizar(); }
                },
            },
        ]);
    }
    function cancelarRenovacao() {
        Alert.alert('Cancelar renovação?', 'Aluno: ' + nome + '. O período pago e o histórico serão preservados.', [
            {
                text: 'Manter',
                style: 'cancel',
            },
            {
                text: 'Cancelar renovação',
                onPress: async function confirmar() {
                    const resultado = await gravacao.enviar(base + '/cancelar-renovacao', 'POST', {});
                    if (resultado) { atualizar(); }
                },
            },
        ]);
    }
    return (
        <View style={estilos.grupo}>
            <Text style={estilos.subtitulo}>Cobertura e pagamentos</Text>
            <EstadoConsulta consulta={situacao} />
            <SituacaoFinanceira situacao={situacao.dados} />
            {podeGerir && (
                <View style={estilos.cartao}>
                    <Text style={estilos.subtitulo}>Registrar pagamento pendente</Text>
                    <Text style={estilos.descricao}>{'Aluno: ' + nome + '. O registro não confirma recebimento nem libera cobertura.'}</Text>
                    <EstadoConsulta consulta={catalogo} />
                    {planos.map(function mostrar(item) {
                        let titulo = item.nome + ' · ' + moeda(item.precoCentavos);
                        if (item.id === planoId) { titulo = '✓ ' + titulo; }
                        return (
                            <Botao
                                key={item.id}
                                titulo={titulo}
                                secundario
                                desabilitado={gravacao.ocupado}
                                aoPressionar={function selecionar() { definirPlanoId(item.id); }}
                            />
                        );
                    })}
                    {!catalogo.carregando && !catalogo.erro && !planos.length && (
                        <Text style={estilos.descricao}>Nenhum plano ativo disponível.</Text>
                    )}
                    <CampoSelecao
                        rotulo="Método"
                        valor={metodo}
                        opcoes={['pix', 'dinheiro', 'debito', 'credito']}
                        aoAlterar={definirMetodo}
                    />
                    <Campo
                        rotulo="Referência do comprovante (opcional)"
                        value={comprovante}
                        onChangeText={definirComprovante}
                        maxLength={500}
                        editable={!gravacao.ocupado}
                    />
                    <Botao
                        titulo="Registrar pendência"
                        desabilitado={gravacao.ocupado || !plano}
                        aoPressionar={registrar}
                    />
                    {situacao.dados && situacao.dados.assinatura && !situacao.dados.assinatura.canceladaEm && (
                        <Botao
                            titulo="Cancelar renovação"
                            secundario
                            desabilitado={gravacao.ocupado}
                            aoPressionar={cancelarRenovacao}
                        />
                    )}
                    <EnvioPendente
                        gravacao={gravacao}
                        aoConfirmar={atualizar}
                    />
                </View>
            )}
            <EstadoConsulta consulta={pagamentos} />
            {!pagamentos.carregando && !pagamentos.erro && !lista.length && (
                <Text style={estilos.descricao}>Nenhum pagamento nesta página.</Text>
            )}
            {lista.map(function mostrar(item) {
                let estado = 'Pendente de confirmação';
                if (item.confirmadoEm) { estado = 'Confirmado em ' + new Date(item.confirmadoEm).toLocaleString('pt-BR'); }
                return (
                    <View
                        key={item.id}
                        style={estilos.cartao}
                    >
                        <Text style={estilos.texto}>{item.plano.nome + ' · ' + moeda(item.valorCentavos)}</Text>
                        <Text style={estilos.descricao}>{item.metodo + ' · ' + estado}</Text>
                        {Boolean(item.comprovante) && (
                            <Text style={estilos.descricao}>{item.comprovante}</Text>
                        )}
                        {podeGerir && !item.confirmadoEm && (
                            <Botao
                                titulo="Conferir e confirmar recebimento"
                                desabilitado={gravacao.ocupado}
                                aoPressionar={function confirmar() { confirmarPagamento(item); }}
                            />
                        )}
                    </View>
                );
            })}
            <Paginacao
                pagina={pagina}
                quantidade={lista.length}
                ocupado={pagamentos.carregando || gravacao.ocupado}
                aoAlterar={definirPagina}
            />
        </View>
    );
}
