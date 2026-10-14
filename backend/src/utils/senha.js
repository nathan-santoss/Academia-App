import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { promisify } from 'node:util';
import { Buffer } from 'node:buffer';
import { erroOperacao } from './erro-operacao.js';

const calcularSenha = promisify(scrypt);

let calculosEmAndamento = 0;

async function calcularSenhaLegada(senha, sal = randomBytes(16).toString('hex')) {

    if (calculosEmAndamento >= 2) {

        throw erroOperacao(429, 'Há outras pessoas entrando agora. Aguarde alguns segundos e tente novamente.');
    }

    calculosEmAndamento += 1;

    try {

        const resultado = await calcularSenha(senha, sal, 64, {

            N: 32768,

            r: 8,

            p: 3,

            maxmem: 64 * 1024 * 1024,
        });

        return sal + ':' + resultado.toString('hex');

    } finally {

        calculosEmAndamento -= 1;
    }
}

export async function conferirSenha(senha, senhaProtegida) {
    if (typeof senhaProtegida !== 'string') {
        return false;
    }
    if (/^\$2[ab]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(senhaProtegida)) {
        if (Buffer.byteLength(senha, 'utf8') > 72) {
            return false;
        }
        if (calculosEmAndamento >= 2) {
            throw erroOperacao(429, 'Há outras pessoas entrando agora. Tente novamente em alguns segundos.');
        }
        calculosEmAndamento += 1;
        try {
            return await bcrypt.compare(senha, senhaProtegida);
        } finally {
            calculosEmAndamento -= 1;
        }
    }
    if (!senhaLegada(senhaProtegida)) {
        return false;
    }

    const partes = senhaProtegida.split(':');

    const calculada = await calcularSenhaLegada(senha, partes[0]);

    const esperado = Buffer.from(senhaProtegida);

    const recebido = Buffer.from(calculada);

    if (esperado.length !== recebido.length) {

        return false;
    }

    return timingSafeEqual(esperado, recebido);
}

export function resumirToken(token) {

    return createHash('sha256').update(token).digest('hex');
}

export function senhaLegada(hash) {
    return typeof hash === 'string' && /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(hash);
}

export function cabeNoBcrypt(senha) {
    return Buffer.byteLength(senha, 'utf8') <= 72;
}

export function validarSenhaNova(senha) {
    if (typeof senha !== 'string' || senha.length < 8 || !cabeNoBcrypt(senha)) {
        throw erroOperacao(422, 'Escolha uma senha com pelo menos 8 caracteres e até 72 bytes UTF-8. Acentos e emojis ocupam mais de um byte.');
    }
}

export async function protegerSenha(senha) {
    validarSenhaNova(senha);
    if (calculosEmAndamento >= 2) {
        throw erroOperacao(429, 'Há outras pessoas entrando agora. Tente novamente em alguns segundos.');
    }
    calculosEmAndamento += 1;
    try {
        return await bcrypt.hash(senha, 12);
    } finally {
        calculosEmAndamento -= 1;
    }
}
