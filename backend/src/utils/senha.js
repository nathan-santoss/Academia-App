// Protejo as senhas com scrypt e comparo os resultados sem guardar a senha original.
// Sou chamado pelo serviço de acesso. Uso scrypt para senhas, pois esse cálculo custa tempo e memória; para o token
// aleatório uso SHA-256. Guardo os resultados no banco, mas não a senha nem o token original.

import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { Buffer } from 'node:buffer';
import { erroOperacao } from './erro-operacao.js';

// Transformo a função do Node em uma chamada que posso esperar com await.
const calcularSenha = promisify(scrypt);
// Inicio calculosEmAndamento com 0; vou ajustar esse valor conforme as condições abaixo.
let calculosEmAndamento = 0;

// Calculo uma proteção para a senha com um sal aleatório; devolvo sal e resultado, nunca uma senha recuperável.
export async function protegerSenha(senha, sal = randomBytes(16).toString('hex')) {
    // Limito a memória usada mesmo se alguém fechar a conexão antes do cálculo terminar.
    if (calculosEmAndamento >= 2) {
        // Interrompo este caminho com a mensagem indicada; o catch ou o tratamento da API recebe a falha.
        throw erroOperacao(429, 'Há outras pessoas entrando agora. Aguarde alguns segundos e tente novamente.');
    } // Encerro a conferência de calculosEmAndamento.
    // Acrescento 1 em calculosEmAndamento e guardo o novo resultado nessa mesma variável.
    calculosEmAndamento += 1;
    // Uso um sal diferente por senha para que senhas iguais tenham resultados diferentes.
    try {
        // Espero o resultado antes de preencher resultado. Espero o scrypt terminar; a versão preparada com promisify
        // permite usar await sem escrever um callback para o resultado.
        const resultado = await calcularSenha(senha, sal, 64, {
            // Defino o custo principal do scrypt; um custo maior exige mais trabalho e memória para cada tentativa de
            // senha.
            N: 32768,
            // Configuro o tamanho de trabalho interno do scrypt, que participa do uso de memória do cálculo.
            r: 8,
            // Configuro o fator de trabalho adicional do scrypt para tornar cada tentativa de senha mais custosa.
            p: 3,
            // Limito a memória permitida neste cálculo para que ele caiba no servidor.
            maxmem: 64 * 1024 * 1024,
        }); // Concluo este objeto com os campos que a etapa atual precisa.
        // Junto o sal e o resultado hexadecimal separados por dois-pontos; consigo recuperar o mesmo sal para
        // conferir a senha depois.
        return sal + ':' + resultado.toString('hex');
    // Executo esta limpeza tanto no sucesso quanto na falha para não deixar controles presos.
    } finally {
        // Libero a vaga tanto no sucesso quanto em uma falha do cálculo.
        calculosEmAndamento -= 1;
    } // Concluo a etapa de limpeza do finally.
} // Termino protegerSenha e devolvo o controle a quem chamou.

// Repito o cálculo usando o sal guardado e comparo os resultados para saber se a senha confere.
export async function conferirSenha(senha, senhaProtegida) {
    // Refaço o cálculo com o sal salvo, sem tentar descobrir a senha original.
    const partes = senhaProtegida.split(':');
    // Espero o resultado antes de preencher calculada. Calculo uma proteção para a senha com um sal aleatório;
    // devolvo sal e resultado, nunca uma senha recuperável.
    const calculada = await protegerSenha(senha, partes[0]);
    // Preparo esperado com esta chamada. Converto o texto para bytes com a codificação indicada, permitindo comparar
    // o conteúdo binário.
    const esperado = Buffer.from(senhaProtegida);
    // Preparo recebido com esta chamada. Converto o texto para bytes com a codificação indicada, permitindo comparar
    // o conteúdo binário.
    const recebido = Buffer.from(calculada);

    // Confiro o tamanho antes da comparação para não provocar uma exceção do Node.
    if (esperado.length !== recebido.length) {
        // Devolvo false como resultado desta conferência para quem chamou a função.
        return false;
    } // Encerro a conferência de esperado.length.
    // Devolvo o resultado desta chamada a quem pediu esta etapa. Comparo os bytes com uma função que evita encerrar a
    // comparação logo na primeira diferença.
    return timingSafeEqual(esperado, recebido);
} // Termino conferirSenha e devolvo o controle a quem chamou.

// Transformo o token aleatório em um resumo para buscar a sessão sem guardar a credencial original no banco.
export function resumirToken(token) {
    // Guardo só o resumo no banco; ele não serve como credencial para entrar no app.
    return createHash('sha256').update(token).digest('hex');
} // Termino resumirToken e devolvo o controle a quem chamou.
