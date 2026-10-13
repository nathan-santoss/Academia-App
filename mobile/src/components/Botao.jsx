// Padronizo os botões de ação, incluindo aparência, toque e estado desabilitado.
import { Pressable, Text } from 'react-native';
import { estilos } from '../theme/tema';

export default function Botao({ titulo, aoPressionar, desabilitado = false, secundario = false }) {
    // Escolho a aparência sem alterar o comportamento do botão.
    const estiloBotao = [];
    const estiloTexto = [];
    estiloBotao.push(estilos.botao);
    estiloTexto.push(estilos.botaoTexto);

    if (secundario) {
        estiloBotao.push(estilos.botaoSecundario);
        estiloTexto.push(estilos.textoSecundario);
    }

    if (desabilitado) {
        estiloBotao.push(estilos.desabilitado);
    }

    // Sinalizo o toque com transparência e mantenho uma área confortável para pressionar.
    function apresentarEstilo({ pressed }) {
        if (pressed) {
            return [...estiloBotao, estilos.pressionado];
        }

        return estiloBotao;
    }

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{
                disabled: desabilitado,
            }}
            disabled={desabilitado}
            onPress={aoPressionar}
            style={apresentarEstilo}
        >
            <Text style={estiloTexto}>{titulo}</Text>
        </Pressable>
    );
}
