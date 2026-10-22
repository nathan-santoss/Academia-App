import { Pressable, StyleSheet, View } from 'react-native';
import { cores } from '../theme/tema';

export default function BotaoVisibilidadeSenha({ visivel, aoAlternar, desabilitado = false, rotulo }) {
    let descricao = 'Mostrar senha';
    if (visivel) { descricao = 'Ocultar senha'; }

    return (
        <Pressable
            style={function apresentar({ pressed }) {
                if (pressed || desabilitado) { return [visual.botao, visual.atenuado]; }
                return visual.botao;
            }}
            onPress={aoAlternar}
            disabled={desabilitado}
            accessibilityRole="button"
            accessibilityLabel={descricao + ' — ' + rotulo}
            accessibilityState={{
                disabled: desabilitado,
            }}
        >
            <View
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                style={visual.icone}
            >
                <View style={visual.olho}>
                    <View style={visual.pupila} />
                </View>
                {!visivel && <View style={visual.traco} />}
            </View>
        </Pressable>
    );
}

// Desenho o olho com formas simples para reutilizá-lo sem carregar fontes ou imagens.
const visual = StyleSheet.create({
    botao: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 52,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    atenuado: {
        opacity: 0.5,
    },
    icone: {
        width: 26,
        height: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    olho: {
        width: 24,
        height: 16,
        borderWidth: 2,
        borderColor: cores.secundario,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pupila: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: cores.secundario,
    },
    traco: {
        position: 'absolute',
        width: 28,
        height: 2,
        backgroundColor: cores.secundario,
        transform: [{
            rotate: '-45deg',
        }],
    },
});
