// Reúno rótulo e entrada de texto para manter os formulários consistentes.
// Recebo as propriedades da tela e monto esta parte da interface. Devolvo os eventos para as funções recebidas para
// manter a ação no lugar que possui os dados. Sou usado por CadastroAluno.jsx, CadastroLembrete.jsx, Entrar.jsx.

import { Text, TextInput, View } from 'react-native';
import { cores, estilos } from '../theme/tema';

// Junto rótulo e entrada de texto para reaproveitar o mesmo comportamento nos formulários.
export default function Campo(propriedades) {
    // Mantenho o rótulo visível mesmo depois que a pessoa começa a digitar.
    return (
        // Agrupo estes elementos num bloco para aplicar seu layout em conjunto.
        <View style={estilos.grupo}>
            {/* Exibo propriedades.rotulo dentro do Text; as chaves levam o valor JavaScript para a tela. */}
            <Text style={estilos.texto}>{propriedades.rotulo}</Text>
            {/* Exibo uma entrada nativa e ligo sua digitação ao estado recebido. */}
            <TextInput
                // Aplico estilos.campo ao TextInput para aproveitar os estilos compartilhados.
                style={estilos.campo}
                // Escolho uma cor mais discreta para separar o exemplo do texto realmente digitado.
                placeholderTextColor={cores.secundario}
                // Uso a cor de destaque no cursor e na seleção do texto digitado.
                selectionColor={cores.destaque}
                // Forneço uma descrição para o leitor de tela identificar a função deste controle.
                accessibilityLabel={propriedades.rotulo}
                // Mostro propriedades.value no TextInput; quando a pessoa altera o campo, onChangeText ou
                // onValueChange avisa quem guarda o estado.
                value={propriedades.value}
                // Entrego o texto digitado a propriedades.onChangeText para atualizar este campo no estado e mostrar
                // seu novo valor.
                onChangeText={propriedades.onChangeText}
                // Controlo se a entrada aceita edição para não mudar o pedido enquanto ele está sendo enviado.
                editable={propriedades.editable}
                // Limito a quantidade de caracteres na entrada; mantenho a validação da API porque o celular não é a
                // única forma de enviar dados.
                maxLength={propriedades.maxLength}
                // Mostro um exemplo enquanto o campo está vazio; esse texto não vira um valor cadastrado.
                placeholder={propriedades.placeholder}
                // Peço o teclado adequado ao dado, como números ou e-mail, para facilitar a digitação.
                keyboardType={propriedades.keyboardType}
                // Defino quando o teclado pode colocar maiúsculas automaticamente; em e-mail e senha preservo o que
                // foi digitado.
                autoCapitalize={propriedades.autoCapitalize}
                // Controlo a correção automática do teclado para evitar que ela altere dados como e-mail e senha.
                autoCorrect={propriedades.autoCorrect}
                // Ligo a ação do teclado à função indicada para permitir enviar sem procurar o botão na tela.
                onSubmitEditing={propriedades.onSubmitEditing}
                // Escolho o texto ou símbolo da tecla de ação para indicar o próximo passo no teclado.
                returnKeyType={propriedades.returnKeyType}
                // Escondo os caracteres da senha na tela; a proteção do armazenamento continua sendo responsabilidade
                // do serviço de acesso.
                secureTextEntry={propriedades.secureTextEntry}
            // Concluo os atributos de TextInput; este elemento não recebe conteúdo filho.
            />
            {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
        </View>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino Campo e devolvo o controle a quem chamou.
