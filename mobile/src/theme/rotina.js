import { StyleSheet } from 'react-native';
import { cores } from './tema';

// Reduzo o espaço visual, preservando uma área de toque confortável.
export const visualRotina = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: cores.fundo,
    },
    conteudo: {
        padding: 16,
        gap: 16,
        width: '100%',
        maxWidth: 640,
        alignSelf: 'center',
    },
    grupo: {
        gap: 8,
    },
    linha: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
    },
    expandir: {
        flex: 1,
        minWidth: 0,
    },
    titulo: {
        color: cores.texto,
        fontSize: 20,
        fontWeight: '700',
    },
    nome: {
        color: cores.texto,
        fontSize: 15,
        fontWeight: '600',
    },
    detalhe: {
        color: cores.secundario,
        fontSize: 13,
        lineHeight: 19,
    },
    erro: {
        color: cores.erro,
        fontSize: 14,
    },
    campo: {
        color: cores.texto,
        backgroundColor: cores.superficie,
        borderColor: cores.borda,
        borderWidth: 1,
        borderRadius: 8,
        minHeight: 44,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 15,
    },
    acao: {
        minHeight: 44,
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: cores.destaque,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 1,
    },
    acaoSecundaria: {
        backgroundColor: cores.superficie,
        borderColor: cores.borda,
        borderWidth: 1,
    },
    selecionada: {
        borderColor: cores.destaque,
    },
    textoAcao: {
        color: cores.sobreDestaque,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    textoSecundario: {
        color: cores.texto,
    },
    inativa: {
        opacity: 0.5,
    },
    pressionada: {
        opacity: 0.75,
    },
    cartao: {
        padding: 12,
        gap: 6,
        backgroundColor: cores.superficie,
        borderRadius: 10,
        borderColor: cores.borda,
        borderWidth: 1,
    },
    rodape: {
        borderTopWidth: 1,
        borderTopColor: cores.borda,
        padding: 12,
        gap: 8,
        width: '100%',
        maxWidth: 640,
        alignSelf: 'center',
        backgroundColor: cores.fundo,
    },
    listaEmbutida: {
        maxHeight: 360,
    },
    abas: {
        gap: 8,
        paddingVertical: 4,
    },
});
