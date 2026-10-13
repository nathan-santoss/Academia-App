// Centralizo cores, espaços e estilos para manter a aparência das telas consistente.
import { StyleSheet } from 'react-native';

// Centralizo a paleta escura com branco e laranja prevista na documentação.
export const cores = {
    fundo: '#101114',
    superficie: '#1B1D22',
    borda: '#393D46',
    texto: '#F6F5F1',
    secundario: '#B8BBC5',
    destaque: '#FF914D',
    sobreDestaque: '#17110D',
    erro: '#FFB4AB',
    sucesso: '#AADCC1',
};

// Compartilho os espaços e formatos para manter as telas consistentes.
export const estilos = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: cores.fundo,
    },
    conteudo: {
        padding: 24,
        gap: 20,
        width: '100%',
        maxWidth: 720,
        alignSelf: 'center',
    },
    grupo: {
        gap: 12,
    },
    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    expandir: {
        flex: 1,
    },
    etiqueta: {
        color: cores.destaque,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
    },
    titulo: {
        color: cores.texto,
        fontSize: 32,
        fontWeight: '700',
    },
    subtitulo: {
        color: cores.texto,
        fontSize: 20,
        fontWeight: '600',
    },
    texto: {
        color: cores.texto,
        fontSize: 16,
        lineHeight: 24,
    },
    descricao: {
        color: cores.secundario,
        fontSize: 15,
        lineHeight: 22,
    },
    cartao: {
        backgroundColor: cores.superficie,
        borderColor: cores.borda,
        borderWidth: 1,
        borderRadius: 16,
        padding: 20,
        gap: 12,
    },
    campo: {
        color: cores.texto,
        backgroundColor: cores.superficie,
        borderColor: cores.borda,
        borderWidth: 1,
        borderRadius: 12,
        minHeight: 52,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    botao: {
        minHeight: 52,
        backgroundColor: cores.destaque,
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    botaoTexto: {
        color: cores.sobreDestaque,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    botaoSecundario: {
        backgroundColor: cores.superficie,
        borderWidth: 1,
        borderColor: cores.borda,
    },
    textoSecundario: {
        color: cores.texto,
    },
    desabilitado: {
        opacity: 0.45,
    },
    pressionado: {
        opacity: 0.7,
    },
    erro: {
        color: cores.erro,
    },
    sucesso: {
        color: cores.sucesso,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#38291F',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iniciais: {
        color: cores.destaque,
        fontSize: 20,
        fontWeight: '700',
    },
    separador: {
        height: 12,
    },
    foto: {
        width: 100,
        height: 100,
        borderRadius: 20,
    },
});
