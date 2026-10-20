import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Botao from './Botao';
import Campo from './Campo';
import CampoSelecao from './CampoSelecao';
import EstadoConsulta from './EstadoConsulta';
import EnvioPendente from './EnvioPendente';
import Paginacao from './Paginacao';
import useConsulta from '../hooks/useConsulta';
import useGravacao from '../hooks/useGravacao';
import { dataDia, hojeAcademia } from '../utils/apresentar-dados';
import { estilos } from '../theme/tema';

export default function BeneficiosAluno({ alunoId, nome, podeGerir = false }) {
    const [pagina, definirPagina] = useState(0);
    const [origem, definirOrigem] = useState('cortesia');
    const [inicio, definirInicio] = useState(hojeAcademia());
    const [fim, definirFim] = useState('');
    const [motivo, definirMotivo] = useState('');
    const base = '/financeiro/alunos/' + alunoId + '/beneficios';
    const consulta = useConsulta(base + '?pagina=' + pagina);
    const gravacao = useGravacao('beneficios-' + alunoId);
    const lista = consulta.dados || [];
    async function conceder() {
        const resultado = await gravacao.enviar(base, 'POST', {
            origem: origem,
            inicio: inicio,
            fim: fim,
            motivo: motivo,
        });
        if (resultado) { consulta.atualizar(); definirMotivo(''); }
    }
    function revogar(item) {
        Alert.alert('Revogar benefício?', nome + '. Motivo: ' + motivo + '. O histórico será preservado.', [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Revogar',
                style: 'destructive',
                onPress: async function confirmar() {
                    const resultado = await gravacao.enviar(base + '/' + item.id + '/revogar', 'POST', {
                        motivo: motivo,
                    });
                    if (resultado) { consulta.atualizar(); definirMotivo(''); }
                },
            },
        ]);
    }
    return (
        <View style={estilos.grupo}>
            <Text style={estilos.subtitulo}>Benefícios e cortesias</Text>
            {podeGerir && (
                <View style={estilos.cartao}>
                    <Text style={estilos.descricao}>{'Aluno: ' + nome + '. Benefícios começam após a cobertura paga, conforme as regras da academia.'}</Text>
                    <CampoSelecao
                        rotulo="Origem"
                        valor={origem}
                        opcoes={['cortesia', 'funcional']}
                        aoAlterar={definirOrigem}
                    />
                    <Campo
                        rotulo="Início (AAAA-MM-DD)"
                        value={inicio}
                        onChangeText={definirInicio}
                        maxLength={10}
                        editable={!gravacao.ocupado}
                    />
                    <Campo
                        rotulo="Fim (AAAA-MM-DD)"
                        value={fim}
                        onChangeText={definirFim}
                        maxLength={10}
                        editable={!gravacao.ocupado}
                    />
                    <Campo
                        rotulo="Motivo da concessão ou revogação"
                        value={motivo}
                        onChangeText={definirMotivo}
                        maxLength={500}
                        editable={!gravacao.ocupado}
                    />
                    <Botao
                        titulo="Conceder benefício"
                        desabilitado={gravacao.ocupado || !motivo.trim() || !fim}
                        aoPressionar={conceder}
                    />
                    <EnvioPendente
                        gravacao={gravacao}
                        aoConfirmar={consulta.atualizar}
                    />
                </View>
            )}
            <EstadoConsulta consulta={consulta} />
            {!consulta.carregando && !consulta.erro && !lista.length && (
                <Text style={estilos.descricao}>Nenhum benefício nesta página.</Text>
            )}
            {lista.map(function mostrar(item) {
                return (
                    <View
                        key={item.id}
                        style={estilos.cartao}
                    >
                        <Text style={estilos.texto}>{item.origem + ' · ' + item.estado.replaceAll('_', ' ')}</Text>
                        <Text style={estilos.descricao}>{dataDia(item.inicio) + ' até ' + dataDia(item.fim)}</Text>
                        <Text style={estilos.descricao}>{item.motivo}</Text>
                        {podeGerir && !item.revogadoEm && (
                            <Botao
                                titulo="Revogar benefício"
                                secundario
                                desabilitado={gravacao.ocupado || !motivo.trim()}
                                aoPressionar={function confirmar() { revogar(item); }}
                            />
                        )}
                    </View>
                );
            })}
            <Paginacao
                pagina={pagina}
                quantidade={lista.length}
                ocupado={consulta.carregando || gravacao.ocupado}
                aoAlterar={definirPagina}
            />
        </View>
    );
}
