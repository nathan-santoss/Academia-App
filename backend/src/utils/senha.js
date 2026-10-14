// Protejo as senhas com scrypt e comparo os resultados sem guardar a senha original.
import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { Buffer } from 'node:buffer';
import { erroOperacao } from './erro-operacao.js';

// Transformo a função do Node em uma chamada que posso esperar com await.
const calcularSenha = promisify(scrypt);
let calculosEmAndamento = 0;

export async function protegerSenha(senha, sal = randomBytes(16).toString('hex')) {
    // Limito a memória usada mesmo se alguém fechar a conexão antes do cálculo terminar.
    if (calculosEmAndamento >= 2) {
        throw erroOperacao(429, 'Há outras pessoas entrando agora. Aguarde alguns segundos e tente novamente.');
    }
    calculosEmAndamento += 1;
    // Uso um sal diferente por senha para que senhas iguais tenham resultados diferentes.
    try {
        const resultado = await calcularSenha(senha, sal, 64, {
            N: 32768,
            r: 8,
            p: 3,
            maxmem: 64 * 1024 * 1024,
        });
        return sal + ':' + resultado.toString('hex');
    } finally {
        // Libero a vaga tanto no sucesso quanto em uma falha do cálculo.
        calculosEmAndamento -= 1;
    }
}

export async function conferirSenha(senha, senhaProtegida) {
    // Refaço o cálculo com o sal salvo, sem tentar descobrir a senha original.
    const partes = senhaProtegida.split(':');
    const calculada = await protegerSenha(senha, partes[0]);
    const esperado = Buffer.from(senhaProtegida);
    const recebido = Buffer.from(calculada);

    // Confiro o tamanho antes da comparação para não provocar uma exceção do Node.
    if (esperado.length !== recebido.length) {
        return false;
    }
    return timingSafeEqual(esperado, recebido);
}

export function resumirToken(token) {
    // Guardo só o resumo no banco; ele não serve como credencial para entrar no app.
    return createHash('sha256').update(token).digest('hex');
}
