import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import BotaoVisibilidadeSenha from './BotaoVisibilidadeSenha';
import { cores, estilos } from '../theme/tema';

export default function Campo(propriedades) {
    // Mantenho a visibilidade independente em cada campo, inclusive na confirmação da senha.
    const [senhaVisivel, definirSenhaVisivel] = useState(false);
    /** @type {import('react-native').TextStyle[]} */
    let estiloCampo = [estilos.campo];
    if (propriedades.secureTextEntry) { estiloCampo = [estilos.campo, visual.espacoBotao]; }

    return (
        <View style={estilos.grupo}>
            <Text style={estilos.texto}>{propriedades.rotulo}</Text>
            <View>
                <TextInput
                    style={estiloCampo}
                    placeholderTextColor={cores.secundario}
                    selectionColor={cores.destaque}
                    accessibilityLabel={propriedades.rotulo}
                    value={propriedades.value}
                    onChangeText={propriedades.onChangeText}
                    editable={propriedades.editable}
                    maxLength={propriedades.maxLength}
                    placeholder={propriedades.placeholder}
                    keyboardType={propriedades.keyboardType}
                    autoCapitalize={propriedades.autoCapitalize}
                    autoCorrect={propriedades.autoCorrect}
                    onSubmitEditing={propriedades.onSubmitEditing}
                    returnKeyType={propriedades.returnKeyType}
                    secureTextEntry={Boolean(propriedades.secureTextEntry) && !senhaVisivel}
                />
                {propriedades.secureTextEntry && (
                    <BotaoVisibilidadeSenha
                        visivel={senhaVisivel}
                        rotulo={propriedades.rotulo}
                        desabilitado={propriedades.editable === false}
                        aoAlternar={function alternar() {
                            definirSenhaVisivel(function inverter(atual) { return !atual; });
                        }}
                    />
                )}
            </View>
        </View>
    );
}

const visual = StyleSheet.create({
    espacoBotao: {
        paddingRight: 60,
    },
});
