import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { erroOperacao } from './erro-operacao.js';

export function conferirConfiguracaoJwt() {
    const segredo = process.env.JWT_SEGREDO;
    if (!segredo || Buffer.byteLength(segredo, 'utf8') < 32) {
        throw erroOperacao(503, 'Configure JWT_SEGREDO privado com pelo menos 32 bytes aleatórios.');
    }
    return segredo;
}

export function emitirToken(contaId, expiraEm) {
    return jwt.sign({
        sub: contaId,
        jti: randomUUID(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(expiraEm.getTime() / 1000),
    }, conferirConfiguracaoJwt(), {
        algorithm: 'HS256',
        issuer: 'academia-api',
        audience: 'academia-mobile',
    });
}

export function verificarToken(token) {
    const segredo = conferirConfiguracaoJwt();
    try {
        const dados = jwt.verify(token, segredo, {
            algorithms: ['HS256'],
            issuer: 'academia-api',
            audience: 'academia-mobile',
        });
        if (typeof dados !== 'object' || typeof dados.sub !== 'string' || typeof dados.jti !== 'string' || !Number.isInteger(dados.iat) || !Number.isInteger(dados.exp) || dados.exp <= dados.iat || dados.iat > Math.floor(Date.now() / 1000)) {
            throw new Error('Claims inválidos.');
        }
        return dados;
    } catch {
        throw erroOperacao(401, 'Sua sessão terminou ou é inválida. Entre novamente.');
    }
}
