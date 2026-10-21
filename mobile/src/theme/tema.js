// Centralizo cores, espaços e estilos para manter a aparência das telas consistente.
// Deixo cores e estilos em um lugar só para que os componentes compartilhem a aparência. Uso StyleSheet.create para
// nomear os estilos; as telas escolhem esses nomes sem repetir os mesmos valores em cada botão ou campo.

import { StyleSheet } from 'react-native';

// Centralizo a paleta escura com branco e laranja prevista na documentação.
export const cores = {
    // Escolho esta cor hexadecimal para o fundo geral e a compartilho pelo tema.
    fundo: '#101114',
    // Escolho esta cor hexadecimal para os cartões e campos e a compartilho pelo tema.
    superficie: '#1B1D22',
    // Escolho esta cor hexadecimal para os contornos e a compartilho pelo tema.
    borda: '#393D46',
    // Escolho esta cor hexadecimal para o texto principal e a compartilho pelo tema.
    texto: '#F6F5F1',
    // Escolho esta cor hexadecimal para as descrições e a compartilho pelo tema.
    secundario: '#B8BBC5',
    // Escolho esta cor hexadecimal para as ações principais e a compartilho pelo tema.
    destaque: '#FF914D',
    // Escolho esta cor hexadecimal para o texto sobre botões laranja e a compartilho pelo tema.
    sobreDestaque: '#17110D',
    // Escolho esta cor hexadecimal para as mensagens de falha e a compartilho pelo tema.
    erro: '#FFB4AB',
    // Escolho esta cor hexadecimal para as confirmações e a compartilho pelo tema.
    sucesso: '#AADCC1',
}; // Concluo este objeto com os campos que a etapa atual precisa.

// Compartilho os espaços e formatos para manter as telas consistentes.
export const estilos = StyleSheet.create({
    // Reúno os estilos de a área principal que ocupa a tela para as telas usarem o mesmo padrão.
    tela: {
        // Deixo este bloco ocupar o espaço disponível no contêiner.
        flex: 1,
        // Escolho a cor de fundo deste bloco usando a paleta compartilhada quando ela aparece aqui.
        backgroundColor: cores.fundo,
    }, // Concluo os campos de tela e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de o espaço de leitura e os formulários para as telas usarem o mesmo padrão.
    conteudo: {
        // Reservo este espaço por dentro da borda para o conteúdo não ficar encostado.
        padding: 16,
        // Separo os elementos filhos por este espaço, sem acrescentar margens em cada um.
        gap: 14,
        // Defino a largura deste elemento para manter o tamanho previsto no layout.
        width: '100%',
        // Limito a largura em telas grandes para não esticar demais os formulários.
        maxWidth: 720,
        // Ajusto a posição deste elemento dentro do espaço oferecido pelo pai.
        alignSelf: 'center',
    }, // Concluo os campos de conteudo e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de os campos que formam um mesmo grupo para as telas usarem o mesmo padrão.
    grupo: {
        // Separo os elementos filhos por este espaço, sem acrescentar margens em cada um.
        gap: 12,
    }, // Concluo os campos de grupo e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de os elementos mostrados lado a lado para as telas usarem o mesmo padrão.
    linha: {
        // Organizo os filhos na direção indicada; row coloca os itens lado a lado.
        flexDirection: 'row',
        // Alinho os filhos no eixo transversal à direção do bloco.
        alignItems: 'center',
        // Separo os elementos filhos por este espaço, sem acrescentar margens em cada um.
        gap: 12,
    }, // Concluo os campos de linha e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de o elemento que deve aproveitar o espaço livre para as telas usarem o mesmo padrão.
    expandir: {
        // Deixo este bloco ocupar o espaço disponível no contêiner.
        flex: 1,
    }, // Concluo os campos de expandir e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de as pequenas etiquetas de seção para as telas usarem o mesmo padrão.
    etiqueta: {
        // Escolho a cor do texto a partir da paleta para manter o mesmo padrão nas telas.
        color: cores.destaque,
        // Defino o tamanho da letra para diferenciar este texto dos demais.
        fontSize: 12,
        // Escolho o peso da letra; números maiores deixam o texto mais forte.
        fontWeight: '700',
        // Aumento a distância entre letras para destacar esta etiqueta.
        letterSpacing: 2,
    }, // Concluo os campos de etiqueta e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de o título principal para as telas usarem o mesmo padrão.
    titulo: {
        // Escolho a cor do texto a partir da paleta para manter o mesmo padrão nas telas.
        color: cores.texto,
        // Defino o tamanho da letra para diferenciar este texto dos demais.
        fontSize: 26,
        // Escolho o peso da letra; números maiores deixam o texto mais forte.
        fontWeight: '700',
    }, // Concluo os campos de titulo e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de os títulos de cada seção para as telas usarem o mesmo padrão.
    subtitulo: {
        // Escolho a cor do texto a partir da paleta para manter o mesmo padrão nas telas.
        color: cores.texto,
        // Defino o tamanho da letra para diferenciar este texto dos demais.
        fontSize: 20,
        // Escolho o peso da letra; números maiores deixam o texto mais forte.
        fontWeight: '600',
    }, // Concluo os campos de subtitulo e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de os textos comuns para as telas usarem o mesmo padrão.
    texto: {
        // Escolho a cor do texto a partir da paleta para manter o mesmo padrão nas telas.
        color: cores.texto,
        // Defino o tamanho da letra para diferenciar este texto dos demais.
        fontSize: 16,
        // Reservo altura para cada linha de texto para facilitar a leitura.
        lineHeight: 24,
    }, // Concluo os campos de texto e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de as explicações e textos secundários para as telas usarem o mesmo padrão.
    descricao: {
        // Escolho a cor do texto a partir da paleta para manter o mesmo padrão nas telas.
        color: cores.secundario,
        // Defino o tamanho da letra para diferenciar este texto dos demais.
        fontSize: 15,
        // Reservo altura para cada linha de texto para facilitar a leitura.
        lineHeight: 22,
    }, // Concluo os campos de descricao e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de os cartões de conteúdo para as telas usarem o mesmo padrão.
    cartao: {
        // Escolho a cor de fundo deste bloco usando a paleta compartilhada quando ela aparece aqui.
        backgroundColor: cores.superficie,
        // Escolho a cor do contorno para separar este elemento do fundo.
        borderColor: cores.borda,
        // Defino a espessura do contorno deste elemento.
        borderWidth: 1,
        // Arredondo os cantos deste elemento para manter o padrão visual.
        borderRadius: 16,
        // Reservo este espaço por dentro da borda para o conteúdo não ficar encostado.
        padding: 14,
        // Separo os elementos filhos por este espaço, sem acrescentar margens em cada um.
        gap: 12,
    }, // Concluo os campos de cartao e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de as entradas dos formulários para as telas usarem o mesmo padrão.
    campo: {
        // Escolho a cor do texto a partir da paleta para manter o mesmo padrão nas telas.
        color: cores.texto,
        // Escolho a cor de fundo deste bloco usando a paleta compartilhada quando ela aparece aqui.
        backgroundColor: cores.superficie,
        // Escolho a cor do contorno para separar este elemento do fundo.
        borderColor: cores.borda,
        // Defino a espessura do contorno deste elemento.
        borderWidth: 1,
        // Arredondo os cantos deste elemento para manter o padrão visual.
        borderRadius: 12,
        // Garanto uma altura mínima para o campo ou botão continuar confortável de tocar.
        minHeight: 44,
        // Afasto o conteúdo das bordas esquerda e direita.
        paddingHorizontal: 16,
        // Afasto o conteúdo das bordas superior e inferior.
        paddingVertical: 10,
        // Defino o tamanho da letra para diferenciar este texto dos demais.
        fontSize: 16,
    }, // Concluo os campos de campo e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de os botões principais para as telas usarem o mesmo padrão.
    botao: {
        // Garanto uma altura mínima para o campo ou botão continuar confortável de tocar.
        minHeight: 44,
        // Escolho a cor de fundo deste bloco usando a paleta compartilhada quando ela aparece aqui.
        backgroundColor: cores.destaque,
        // Arredondo os cantos deste elemento para manter o padrão visual.
        borderRadius: 12,
        // Afasto o conteúdo das bordas esquerda e direita.
        paddingHorizontal: 18,
        // Afasto o conteúdo das bordas superior e inferior.
        paddingVertical: 10,
        // Alinho os filhos no eixo transversal à direção do bloco.
        alignItems: 'center',
        // Alinho os filhos no eixo principal do bloco.
        justifyContent: 'center',
    }, // Concluo os campos de botao e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de o texto dos botões principais para as telas usarem o mesmo padrão.
    botaoTexto: {
        // Escolho a cor do texto a partir da paleta para manter o mesmo padrão nas telas.
        color: cores.sobreDestaque,
        // Defino o tamanho da letra para diferenciar este texto dos demais.
        fontSize: 16,
        // Escolho o peso da letra; números maiores deixam o texto mais forte.
        fontWeight: '700',
        // Alinho o texto dentro do espaço que ele ocupa.
        textAlign: 'center',
    }, // Concluo os campos de botaoTexto e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de os botões de apoio para as telas usarem o mesmo padrão.
    botaoSecundario: {
        // Escolho a cor de fundo deste bloco usando a paleta compartilhada quando ela aparece aqui.
        backgroundColor: cores.superficie,
        // Defino a espessura do contorno deste elemento.
        borderWidth: 1,
        // Escolho a cor do contorno para separar este elemento do fundo.
        borderColor: cores.borda,
    }, // Concluo os campos de botaoSecundario e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de o texto dos botões secundários para as telas usarem o mesmo padrão.
    textoSecundario: {
        // Escolho a cor do texto a partir da paleta para manter o mesmo padrão nas telas.
        color: cores.texto,
    }, // Concluo os campos de textoSecundario e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de os controles indisponíveis para as telas usarem o mesmo padrão.
    desabilitado: {
        // Ajusto a transparência para mostrar visualmente o estado deste elemento.
        opacity: 0.45,
    }, // Concluo os campos de desabilitado e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de a resposta visual ao toque para as telas usarem o mesmo padrão.
    pressionado: {
        // Ajusto a transparência para mostrar visualmente o estado deste elemento.
        opacity: 0.7,
    }, // Concluo os campos de pressionado e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de as mensagens de falha para as telas usarem o mesmo padrão.
    erro: {
        // Escolho a cor do texto a partir da paleta para manter o mesmo padrão nas telas.
        color: cores.erro,
    }, // Concluo os campos de erro e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de as confirmações para as telas usarem o mesmo padrão.
    sucesso: {
        // Escolho a cor do texto a partir da paleta para manter o mesmo padrão nas telas.
        color: cores.sucesso,
    }, // Concluo os campos de sucesso e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de o fundo das iniciais para as telas usarem o mesmo padrão.
    avatar: {
        // Defino a largura deste elemento para manter o tamanho previsto no layout.
        width: 52,
        // Defino a altura deste elemento para manter o tamanho previsto no layout.
        height: 52,
        // Arredondo os cantos deste elemento para manter o padrão visual.
        borderRadius: 16,
        // Escolho a cor de fundo deste bloco usando a paleta compartilhada quando ela aparece aqui.
        backgroundColor: '#38291F',
        // Alinho os filhos no eixo transversal à direção do bloco.
        alignItems: 'center',
        // Alinho os filhos no eixo principal do bloco.
        justifyContent: 'center',
    }, // Concluo os campos de avatar e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de as letras do avatar para as telas usarem o mesmo padrão.
    iniciais: {
        // Escolho a cor do texto a partir da paleta para manter o mesmo padrão nas telas.
        color: cores.destaque,
        // Defino o tamanho da letra para diferenciar este texto dos demais.
        fontSize: 20,
        // Escolho o peso da letra; números maiores deixam o texto mais forte.
        fontWeight: '700',
    }, // Concluo os campos de iniciais e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de o intervalo entre itens da lista para as telas usarem o mesmo padrão.
    separador: {
        // Defino a altura deste elemento para manter o tamanho previsto no layout.
        height: 12,
    }, // Concluo os campos de separador e volto ao objeto que reúne essa configuração.
    // Reúno os estilos de a foto do perfil para as telas usarem o mesmo padrão.
    foto: {
        // Defino a largura deste elemento para manter o tamanho previsto no layout.
        width: 100,
        // Defino a altura deste elemento para manter o tamanho previsto no layout.
        height: 100,
        // Arredondo os cantos deste elemento para manter o padrão visual.
        borderRadius: 20,
    }, // Concluo os campos de foto e volto ao objeto que reúne essa configuração.
}); // Concluo este objeto com os campos que a etapa atual precisa.
