import { randomUUID } from 'node:crypto';
import * as repositorio from '../repositories/provisionamento-repositorio.js';
import { prepararContaDemonstrativa } from '../utils/validar-demonstracao.js';
import { protegerSenha } from '../utils/senha.js';
import { erroOperacao } from '../utils/erro-operacao.js';

async function prepararConta(configuracao, transacao) {
    const existente = await repositorio.buscarConta(configuracao.dados.email, transacao);
    if (existente) {
        const funcionario = await repositorio.buscarFuncionario(existente.id, transacao);
        if (!existente.aluno || !existente.aluno.pessoa || existente.aluno.pessoa.cpf !== configuracao.dados.cpf || !funcionario || !Array.isArray(funcionario.papeis) || !funcionario.papeis.includes(configuracao.papel)) {
            throw erroOperacao(409, 'O e-mail demonstrativo já está em uso por outro vínculo. Nenhuma conta foi promovida.');
        }
        return;
    }
    const hash = await protegerSenha(configuracao.senha);
    await repositorio.criarContaFuncional({
        id: randomUUID(),
        pessoaId: randomUUID(),
        dados: configuracao.dados,
    }, hash, configuracao.papel, transacao);
}

export async function provisionarContas() {
    if (process.env.DEMO_CONTAS_HABILITADO !== 'true' || process.env.AMBIENTE_DEMONSTRACAO !== 'true') {
        return;
    }
    const administrador = prepararContaDemonstrativa('DEMO_ADMIN_', 'administrador');
    const gestor = prepararContaDemonstrativa('DEMO_GESTOR_', 'gestao');
    if (!administrador || !gestor) {
        console.warn('Provisionamento ignorado: configure integralmente as duas identidades demonstrativas.');
        return;
    }
    if (administrador.dados.email === gestor.dados.email || administrador.dados.cpf === gestor.dados.cpf) {
        throw erroOperacao(422, 'Administrador e Gestor exigem identidades demonstrativas diferentes.');
    }
    await repositorio.executarProvisionamento(async function preparar(transacao) {
        await prepararConta(administrador, transacao);
        await prepararConta(gestor, transacao);
    });
    console.log('Provisionamento demonstrativo conferido, preservando contas existentes.');
}
