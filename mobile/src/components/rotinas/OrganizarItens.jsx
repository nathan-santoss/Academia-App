import { useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AcaoRotina from './AcaoRotina';
import { reposicionarItem } from '../../utils/formulario-rotina';
import { visualRotina as visual } from '../../theme/rotina';

export default function OrganizarItens({ itens, aoConfirmar, aoFechar }) {
    const [lista, definirLista] = useState(itens);
    const [origem, definirOrigem] = useState(-1);
    let instrucao = 'Toque no item que deseja mover.';
    if (origem >= 0) { instrucao = 'Agora toque na posição de destino.'; }

    function escolher(indice) {
        if (origem < 0) { definirOrigem(indice); }
        else {
            definirLista(reposicionarItem(lista, origem, indice));
            definirOrigem(-1);
        }
    }

    return (
        <Modal
            animationType="slide"
            onRequestClose={aoFechar}
        >
            <SafeAreaView style={visual.tela}>
                <ScrollView contentContainerStyle={visual.conteudo}>
                    <Text style={visual.titulo}>Organizar ordem</Text>
                    <Text
                        style={visual.detalhe}
                        accessibilityLiveRegion="polite"
                    >{instrucao}</Text>
                    {lista.map(function mostrar(item, indice) {
                        return (
                            <AcaoRotina
                                key={item.id}
                                titulo={String(indice + 1) + '. ' + item.nome}
                                secundaria
                                selecionada={origem === indice}
                                aoPressionar={function selecionar() { escolher(indice); }}
                            />
                        );
                    })}
                </ScrollView>
                <View style={visual.rodape}>
                    <AcaoRotina
                        titulo="Confirmar ordem"
                        aoPressionar={function confirmar() { aoConfirmar(lista); }}
                    />
                    <AcaoRotina
                        titulo="Cancelar"
                        secundaria
                        aoPressionar={aoFechar}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    );
}
