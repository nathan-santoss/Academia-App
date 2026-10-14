// Guardo a credencial de acesso no espaço protegido do celular, sem salvar a senha.
// Uso o SecureStore porque a credencial de sessão permite acessar dados pessoais. Deixo a preferência de vibração no
// AsyncStorage e os cadastros no Neon; este arquivo cuida somente da credencial do login.

import * as SecureStore from 'expo-secure-store';

// Guardo chave com o texto "academia.sessao" para reutilizar esse resultado neste trecho.
const chave = 'academia.sessao';

// Leio a credencial no armazenamento protegido do sistema para recuperar o acesso do aparelho.
export function obterToken() {
    // Recupero a sessão ao reabrir o aplicativo; os dados pessoais continuam no Neon.
    return SecureStore.getItemAsync(chave);
} // Termino obterToken e devolvo o controle a quem chamou.

// Salvo a credencial no SecureStore para recuperar a sessão sem guardar a senha digitada.
export function guardarToken(token) {
    // Evito transferir a credencial para outro aparelho por backup do iOS.
    return SecureStore.setItemAsync(chave, token, {
        // Permito a leitura no iOS com o aparelho desbloqueado e mantenho a credencial vinculada a este dispositivo.
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }); // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino guardarToken e devolvo o controle a quem chamou.

// Retiro a credencial do celular; o encerramento da sessão no servidor é feito pelo serviço de acesso.
export function apagarToken() {
    // Removo o acesso salvo quando a pessoa sai ou a API encerra a sessão.
    return SecureStore.deleteItemAsync(chave);
} // Termino apagarToken e devolvo o controle a quem chamou.
