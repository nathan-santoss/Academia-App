import nodemailer from 'nodemailer';
import { erroOperacao } from '../utils/erro-operacao.js';

export function conferirConfiguracaoEmail() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USUARIO || !process.env.SMTP_SENHA || !process.env.EMAIL_REMETENTE) {
        throw erroOperacao(503, 'Recuperação por e-mail ainda não configurada.');
    }
}

export function transporteEmail() {
    conferirConfiguracaoEmail();
    const porta = Number(process.env.SMTP_PORTA || 465);
    if (![465, 587].includes(porta)) {
        throw erroOperacao(503, 'Configure SMTP com TLS na porta 465 ou 587.');
    }
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: porta,
        secure: porta === 465,
        requireTLS: true,
        auth: {
            user: process.env.SMTP_USUARIO,
            pass: process.env.SMTP_SENHA,
        },
        connectionTimeout: 10000,
        socketTimeout: 15000,
        disableFileAccess: true,
        disableUrlAccess: true,
    });
}
