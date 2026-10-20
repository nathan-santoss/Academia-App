import { Text, View } from 'react-native';
import { dataDia, nomeEstado } from '../utils/apresentar-dados';
import { estilos } from '../theme/tema';

export default function SituacaoFinanceira({ situacao }) {
    if (!situacao) { return null; }
    return (
        <View style={estilos.cartao}>
            <Text style={estilos.subtitulo}>{nomeEstado(situacao.estado)}</Text>
            {situacao.permitida && (
                <Text style={estilos.sucesso}>Cobertura disponível. A presença ainda depende da confirmação da recepção.</Text>
            )}
            {!situacao.permitida && (
                <Text style={estilos.descricao}>Consulte a recepção sobre sua cobertura.</Text>
            )}
            {situacao.assinatura && (
                <View style={estilos.grupo}>
                    <Text style={estilos.texto}>{situacao.assinatura.plano.nome}</Text>
                    <Text style={estilos.descricao}>{'Início: ' + dataDia(situacao.assinatura.inicio) + ' · Vencimento: ' + dataDia(situacao.assinatura.vencimento)}</Text>
                    {situacao.assinatura.toleranciaAte && (
                        <Text style={estilos.descricao}>{'Fim da tolerância (exclusivo): ' + dataDia(situacao.assinatura.toleranciaAte)}</Text>
                    )}
                    {situacao.assinatura.canceladaEm && (
                        <Text style={estilos.descricao}>Renovação cancelada; a vigência já concedida foi preservada.</Text>
                    )}
                </View>
            )}
            {situacao.beneficio && (
                <Text style={estilos.descricao}>{'Benefício até ' + dataDia(situacao.beneficio.fim)}</Text>
            )}
        </View>
    );
}
