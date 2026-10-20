import { useState } from 'react';
import { rotuloOpcao } from '../utils/opcoes-formulario';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Campo from './Campo';
import { estilos } from '../theme/tema';
import { editor } from '../theme/editor';

export default function CampoSelecao({ rotulo, valor, opcoes, aoAlterar, permitirOutro = false, teclado = 'default', emLinha = false }) {
    const [aberto, definirAberto] = useState(false);
    const [personalizado, definirPersonalizado] = useState(false);
    let valorPersonalizado = '';
    if (valor !== null && valor !== undefined) {
        valorPersonalizado = String(valor);
    }
    let texto = 'Selecionar';
    if (valor !== null && valor !== undefined && String(valor) !== '') {
        texto = String(valor);
    }
    const foraDasOpcoes = texto !== 'Selecionar' && !opcoes.includes(texto);
    function fechar() {
        definirAberto(false);
    }
    return (
        <View style={[editor.campo, emLinha && editor.coluna]}>
            <Text style={editor.rotulo}>{rotulo}</Text>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={rotulo + ': ' + rotuloOpcao(texto)}
                accessibilityHint="Abre as opções disponíveis"
                accessibilityState={{
                    expanded: aberto,
                }}
                onPress={function abrir() { definirAberto(true); }}
                style={editor.seletor}
            >
                <Text style={editor.valor}>{rotuloOpcao(texto)}</Text>
                <Text style={editor.seta}>⌄</Text>
            </Pressable>
            {permitirOutro && (personalizado || foraDasOpcoes) && (
                <Campo
                    rotulo={'Personalizar ' + rotulo.toLowerCase()}
                    value={valorPersonalizado}
                    onChangeText={aoAlterar}
                    keyboardType={teclado}
                />
            )}
            <Modal
                visible={aberto}
                transparent
                animationType="fade"
                onRequestClose={fechar}
            >
                <SafeAreaView style={editor.fundoModal}>
                    <View
                        style={editor.modal}
                        accessibilityViewIsModal
                    >
                        <Text style={estilos.subtitulo}>{rotulo}</Text>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            {opcoes.map(function opcao(item) {
                                return (
                                    <Pressable
                                        key={item}
                                        accessibilityRole="radio"
                                        accessibilityState={{
                                            selected: texto === item,
                                        }}
                                        onPress={function selecionar() {
                                            aoAlterar(item);
                                            definirPersonalizado(false);
                                            fechar();
                                        }}
                                        style={editor.opcao}
                                    >
                                        <Text style={editor.valor}>{rotuloOpcao(item)}</Text>
                                        {texto === item && (
                                            <Text style={editor.seta}>✓</Text>
                                        )}
                                    </Pressable>
                                );
                            })}
                            {permitirOutro && (
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={function personalizar() {
                                        definirPersonalizado(true);
                                        fechar();
                                    }}
                                    style={editor.opcao}
                                >
                                    <Text style={estilos.texto}>Personalizar valor</Text>
                                </Pressable>
                            )}
                        </ScrollView>
                        <Pressable
                            accessibilityRole="button"
                            onPress={fechar}
                            style={editor.opcao}
                        >
                            <Text style={editor.seta}>Fechar</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
}
