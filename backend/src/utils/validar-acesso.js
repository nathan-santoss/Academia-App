// Confiro e-mail e senha antes de consultar uma conta ou calcular a proteção da senha.
// Concentro esta pequena tarefa para os outros arquivos chamarem pelo nome, sem repetir a mesma regra em vários
// lugares. Sou usado por limitar-acesso.js, acesso-servico.js.

import { erroOperacao } from './erro-operacao.js';

// Confiro tipos e limites do e-mail e da senha antes de fazer consultas ou cálculos mais caros.
export function validarAcesso(entrada) {
    // Recuso tipos inesperados antes de tentar usar os campos como texto.
    if (!entrada || typeof entrada.email !== 'string' || typeof entrada.senha !== 'string') {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, 'Informe seu e-mail e sua senha.');
    } // Encerro a conferência de esta condição.

    // Preparo email com esta chamada. Passo o texto para minúsculas para comparar escritas de forma consistente.
    const email = entrada.email.trim().toLowerCase();
    // Limito a entrada para evitar cálculos caros com textos sem tamanho definido.
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, 'Informe um e-mail válido.');
    } // Encerro a conferência de esta condição.
    // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
    if (!entrada.senha || entrada.senha.length > 128) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(422, 'Informe uma senha com até 128 caracteres.');
    } // Encerro a conferência de esta condição.
    // Preservo espaços e maiúsculas da senha, pois fazem parte do que a pessoa escolheu.
    return {
        // Preencho o e-mail com o valor preparado para este cadastro ou consulta.
        email: email,
        // Passo a senha somente para o fluxo de acesso; o backend calcula sua proteção antes de gravá-la.
        senha: entrada.senha,
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino validarAcesso e devolvo o controle a quem chamou.
