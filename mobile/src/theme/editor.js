import { StyleSheet } from 'react-native';
import { cores } from './tema';

export const editor = StyleSheet.create({
    grupo: {
        gap: 10,
    },
    campo: {
        gap: 6,
    },
    coluna: {
        flexGrow: 1,
        flexBasis: 120,
        flexShrink: 1,
        minWidth: 0,
    },
    campos: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    rotulo: {
        color: cores.secundario,
        fontSize: 14,
    },
    seletor: {
        minHeight: 44,
        borderWidth: 1,
        borderColor: cores.borda,
        borderRadius: 8,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    valor: {
        color: cores.texto,
        fontSize: 15,
        flexShrink: 1,
        flexGrow: 1,
    },
    seta: {
        color: cores.destaque,
        fontSize: 16,
    },
    cartao: {
        backgroundColor: cores.superficie,
        borderWidth: 1,
        borderColor: cores.borda,
        borderRadius: 10,
        padding: 12,
        gap: 10,
    },
    cabecalho: {
        minHeight: 44,
        justifyContent: 'center',
        gap: 4,
    },
    opcao: {
        minHeight: 44,
        paddingVertical: 12,
        paddingHorizontal: 8,
        flexDirection: 'row',
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: cores.borda,
    },
    fundoModal: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000AA',
    },
    modal: {
        width: '100%',
        maxWidth: 480,
        maxHeight: '85%',
        backgroundColor: cores.superficie,
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
});
