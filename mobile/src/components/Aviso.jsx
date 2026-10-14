// Apresento mensagens de espera ou erro e ofereço nova tentativa quando necessário.
// Recebo a mensagem e as opções da tela. Reúno texto, espera e nova tentativa num componente para os formulários
// usarem a mesma apresentação; a ação do botão continua na função recebida.

import { ActivityIndicator, Text, View } from 'react-native';
import { cores, estilos } from '../theme/tema';
import Botao from './Botao';

// Monto uma mensagem reutilizável; posso acrescentar indicador de espera e botão para tentar novamente.
export default function Aviso({ mensagem, carregando = false, erro = false, aoTentar = null }) {
    // Oculto o aviso quando não existe nada para comunicar.
    if (!mensagem) {
        // Devolvo null para indicar que não há um resultado a entregar neste caminho.
        return null;
    } // Encerro a conferência de mensagem.

    // Reúno os itens em estiloTexto para trabalhar com eles como uma lista.
    const estiloTexto = [];
    // Acrescento este item ao fim da lista que estou preparando.
    estiloTexto.push(estilos.descricao);

    // Escolho a apresentação de falha quando há uma mensagem para mostrar.
    if (erro) {
        // Acrescento este item ao fim da lista que estou preparando.
        estiloTexto.push(estilos.erro);
    } // Encerro a conferência de erro.

    // Diferencio espera e falha por texto, além da cor e do indicador de atividade.
    return (
        // Agrupo estes elementos num bloco para aplicar seu layout em conjunto.
        <View
            // Aplico estilos.cartao ao View para aproveitar os estilos compartilhados.
            style={estilos.cartao}
            // Peço que alterações nesta mensagem sejam anunciadas pelo recurso de acessibilidade.
            accessibilityLiveRegion="polite"
        // Concluo os atributos de View e começo seu conteúdo filho.
        >
            {/* Passo color ao componente para ele usar essa configuração. */}
            {carregando && <ActivityIndicator color={cores.destaque} />}
            {/* Exibo mensagem dentro do Text; as chaves levam o valor JavaScript para a tela. */}
            <Text style={estiloTexto}>{mensagem}</Text>
            {/* Mostro este trecho somente quando a condição à esquerda de && permite; se ela for falsa, não monto
                o conteúdo. */}
            {aoTentar && (
                // Monto Botao para apresentar o texto "Tentar novamente" e reaproveitar o comportamento desse
                // componente.
                <Botao
                    // Uso o texto "Tentar novamente" como texto desta ação para indicar o que acontece no toque.
                    titulo="Tentar novamente"
                    // Ligo o toque a aoTentar; passo a função sem executá-la agora para ela rodar só quando a pessoa
                    // tocar.
                    aoPressionar={aoTentar}
                    // Escolho a aparência de ação secundária sem mudar a função executada pelo botão.
                    secundario
                // Concluo os atributos de Botao; este elemento não recebe conteúdo filho.
                />
            // Concluo esta expressão JavaScript e volto à composição visual da tela.
            )}
            {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
        </View>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino Aviso e devolvo o controle a quem chamou.
