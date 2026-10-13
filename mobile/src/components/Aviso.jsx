// Apresento mensagens de espera ou erro e ofereço nova tentativa quando necessário.
import { ActivityIndicator, Text, View } from 'react-native';
import { cores, estilos } from '../theme/tema';
import Botao from './Botao';

export default function Aviso({ mensagem, carregando = false, erro = false, aoTentar = null }) {
    // Oculto o aviso quando não existe nada para comunicar.
    if (!mensagem) {
        return null;
    }

    const estiloTexto = [];
    estiloTexto.push(estilos.descricao);

    if (erro) {
        estiloTexto.push(estilos.erro);
    }

    // Diferencio espera e falha por texto, além da cor e do indicador de atividade.
    return (
        <View
            style={estilos.cartao}
            accessibilityLiveRegion="polite"
        >
            {carregando && <ActivityIndicator color={cores.destaque} />}
            <Text style={estiloTexto}>{mensagem}</Text>
            {aoTentar && (
                <Botao
                    titulo="Tentar novamente"
                    aoPressionar={aoTentar}
                    secundario
                />
            )}
        </View>
    );
}
