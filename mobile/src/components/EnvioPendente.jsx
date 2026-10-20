import { Text, View } from 'react-native';
import Botao from './Botao';
import { estilos } from '../theme/tema';

export default function EnvioPendente({ gravacao, aoConfirmar }) {
    return (
        <View style={estilos.grupo}>
            {Boolean(gravacao.mensagem) && (
                <Text
                    accessibilityLiveRegion="polite"
                    style={estilos.descricao}
                >{gravacao.mensagem}</Text>
            )}
            <Botao
                titulo="Repetir envio pendente"
                secundario
                desabilitado={gravacao.ocupado}
                aoPressionar={async function repetir() {
                    const resultado = await gravacao.repetir();
                    if (resultado) { aoConfirmar(); }
                }}
            />
        </View>
    );
}
