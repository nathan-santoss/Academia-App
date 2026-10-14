// Padronizo os botões de ação, incluindo aparência, toque e estado desabilitado.
// Recebo as propriedades da tela e monto esta parte da interface. Devolvo os eventos para as funções recebidas para
// manter a ação no lugar que possui os dados. Sou usado por Aviso.jsx, CadastroAluno.jsx, CadastroLembrete.jsx e
// outros arquivos do mesmo fluxo.

import { Pressable, Text } from 'react-native';
import { estilos } from '../theme/tema';

// Monto o botão de ação com estados de toque, aparência secundária e bloqueio durante uma operação.
export default function Botao({ titulo, aoPressionar, desabilitado = false, secundario = false }) {
    // Escolho a aparência sem alterar o comportamento do botão.
    const estiloBotao = [];
    // Reúno os itens em estiloTexto para trabalhar com eles como uma lista.
    const estiloTexto = [];
    // Acrescento este item ao fim da lista que estou preparando.
    estiloBotao.push(estilos.botao);
    // Acrescento este item ao fim da lista que estou preparando.
    estiloTexto.push(estilos.botaoTexto);

    // Aplico a aparência de apoio quando a tela pediu um botão secundário.
    if (secundario) {
        // Acrescento este item ao fim da lista que estou preparando.
        estiloBotao.push(estilos.botaoSecundario);
        // Acrescento este item ao fim da lista que estou preparando.
        estiloTexto.push(estilos.textoSecundario);
    } // Encerro a conferência de secundario.

    // Acrescento a aparência de bloqueio para mostrar que o botão não aceita a ação agora.
    if (desabilitado) {
        // Acrescento este item ao fim da lista que estou preparando.
        estiloBotao.push(estilos.desabilitado);
    } // Encerro a conferência de desabilitado.

    // Sinalizo o toque com transparência e mantenho uma área confortável para pressionar.
    function apresentarEstilo({ pressed }) {
        // Uso a aparência de toque enquanto o Pressable informa que está pressionado.
        if (pressed) {
            // Devolvo o resultado desta chamada a quem pediu esta etapa. Uso concat para criar outra lista de estilos
            // com o novo item, sem alterar a lista preparada antes.
            return estiloBotao.concat(estilos.pressionado);
        } // Encerro a conferência de pressed.

        // Entrego estiloBotao a quem chamou a função e termino este caminho.
        return estiloBotao;
    } // Termino apresentarEstilo e devolvo o controle a quem chamou.

    // Devolvo os componentes que o React deve montar para esta parte da tela.
    return (
        // Recebo os toques e uso o estado de pressão para dar retorno visual ao botão.
        <Pressable
            // Informo ao leitor de tela se este controle funciona como botão ou link.
            accessibilityRole="button"
            // Comunico o estado do controle também para quem usa recursos de acessibilidade.
            accessibilityState={{
                // Bloqueio o toque conforme o estado recebido para evitar ações durante a espera.
                disabled: desabilitado,
            }} // Concluo este objeto com os campos que a etapa atual precisa.
            // Bloqueio o toque conforme o estado recebido para evitar ações durante a espera.
            disabled={desabilitado}
            // Escolho a função chamada no toque; deixo a execução para o evento do usuário.
            onPress={aoPressionar}
            // Aplico apresentarEstilo ao Pressable para aproveitar os estilos compartilhados.
            style={apresentarEstilo}
        // Concluo os atributos de Pressable e começo seu conteúdo filho.
        >
            {/* Exibo titulo dentro do Text; as chaves levam o valor JavaScript para a tela. */}
            <Text style={estiloTexto}>{titulo}</Text>
            {/* Encerro o conteúdo de Pressable; os próximos elementos ficam fora deste bloco. */}
        </Pressable>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino Botao e devolvo o controle a quem chamou.
