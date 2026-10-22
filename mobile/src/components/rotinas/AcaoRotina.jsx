import { Pressable, Text } from 'react-native';
import { visualRotina as visual } from '../../theme/rotina';

export default function AcaoRotina({ titulo, aoPressionar, secundaria = false, desabilitada = false, selecionada = undefined, descricao = undefined }) {
    /** @type {import('react-native').ViewStyle[]} */
    const estilo = [visual.acao];
    /** @type {import('react-native').TextStyle[]} */
    const texto = [visual.textoAcao];
    if (secundaria) {
        estilo.push(visual.acaoSecundaria);
        texto.push(visual.textoSecundario);
    }
    if (selecionada) { estilo.push(visual.selecionada); }
    if (desabilitada) { estilo.push(visual.inativa); }
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={titulo}
            accessibilityHint={descricao}
            accessibilityState={{
                disabled: desabilitada,
                selected: selecionada,
            }}
            disabled={desabilitada}
            onPress={aoPressionar}
            style={function pressionar(estado) {
                if (estado.pressed) { return estilo.concat(visual.pressionada); }
                return estilo;
            }}
        >
            <Text style={texto}>{titulo}</Text>
        </Pressable>
    );
}
