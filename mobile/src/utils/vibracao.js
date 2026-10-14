// Aciono a vibração de confirmação quando a preferência do usuário permite.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por CadastroAluno.jsx, CadastroLembrete.jsx.

import { Vibration } from 'react-native';

// Tento uma vibração apenas quando a preferência permite, sem desfazer o cadastro se o aparelho não conseguir vibrar.
export function vibrarAoConcluir(ativada) {
    // Confiro se ativada não está disponível ou está falso antes de executar o bloco abaixo.
    if (!ativada) {
        // Termino esta chamada aqui para não executar os próximos passos deste caminho.
        return;
    } // Encerro a conferência de ativada.

    // Aciono uma vibração simples; a duração pode variar entre Android e iOS.
    try {
        // Peço uma vibração curta como confirmação da ação concluída.
        Vibration.vibrate();
    // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
    } catch {
    } // Termino o tratamento desta falha e sigo para a limpeza, quando houver.
} // Termino vibrarAoConcluir e devolvo o controle a quem chamou.
