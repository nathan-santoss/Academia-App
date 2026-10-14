// Leio e salvo a escolha de vibração no AsyncStorage para recuperá-la na próxima abertura.
// Recebo pedidos das telas ou dos contextos e concentro esta tarefa para eles não repetirem a mesma preparação. Sou
// usado por PreferenciasContext.jsx.

import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardo chavePreferencias com o texto "academia:preferencias" para reutilizar esse resultado neste trecho.
const chavePreferencias = 'academia:preferencias';

// Leio o texto guardado no AsyncStorage e recupero a escolha de vibração, com um padrão quando não há registro.
export async function lerPreferencias() {
    // Recupero somente preferências do aparelho, sem armazenar dados de alunos.
    const texto = await AsyncStorage.getItem(chavePreferencias);

    // Uso o padrão quando o armazenamento ainda não tem uma preferência salva.
    if (!texto) {
        // Devolvo false como resultado desta conferência para quem chamou a função.
        return false;
    } // Encerro a conferência de texto.

    // Preparo preferencias com esta chamada. Reconstruo os dados a partir do texto JSON salvo ou recebido.
    const preferencias = JSON.parse(texto);
    // Entrego o resultado da comparação entre preferencias.vibracaoAtiva e true a quem chamou a função e termino este
    // caminho.
    return preferencias.vibracaoAtiva === true;
} // Termino lerPreferencias e devolvo o controle a quem chamou.

// Transformo a preferência em texto para guardá-la no AsyncStorage sob uma chave conhecida.
export async function salvarPreferencias(vibracaoAtiva) {
    // Converto o objeto em texto porque o Storage guarda pares de chave e valor.
    await AsyncStorage.setItem(chavePreferencias, JSON.stringify({
        // Compartilho a escolha de vibração para os formulários respeitarem essa preferência.
        vibracaoAtiva: vibracaoAtiva,
    })); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino salvarPreferencias e devolvo o controle a quem chamou.
