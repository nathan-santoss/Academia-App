import { useRef, useState } from 'react';
import { randomUUID } from 'expo-crypto';
import { useAcesso } from '../contexts/AcessoContext';
import { solicitarApi } from '../services/api';
import { lerRascunho, guardarRascunho, apagarRascunho } from '../services/rascunho-treino-servico';

// Mantenho a chave e o conteúdo cifrados até confirmar a operação. A repetição reenvia exatamente o mesmo pedido.
export default function useGravacao(nome) {
    const { usuario } = useAcesso();
    const trava = useRef(false);
    const [ocupado, definirOcupado] = useState(false);
    const [mensagem, definirMensagem] = useState('');
    async function enviar(caminho, metodo, dados) {
        if (trava.current) { return null; }
        trava.current = true;
        definirOcupado(true);
        const tipo = 'operacao-' + nome;
        try {
            const corpo = JSON.stringify(dados);
            let pedido = await lerRascunho(usuario.id, tipo);
            if (pedido && (pedido.caminho !== caminho || pedido.metodo !== metodo || pedido.corpo !== corpo)) {
                throw new Error('Existe uma gravação sem confirmação. Toque em Repetir envio pendente antes de fazer outra alteração.');
            }
            if (!pedido) {
                pedido = {
                    caminho: caminho,
                    metodo: metodo,
                    corpo: corpo,
                    chave: randomUUID(),
                };
                await guardarRascunho(usuario.id, tipo, pedido);
            }
            let resultado;
            try {
                resultado = await solicitarApi(pedido.caminho, {
                    method: pedido.metodo,
                    body: pedido.corpo,
                    headers: {
                        'Idempotency-Key': pedido.chave,
                    },
                });
            } catch (falha) {
                if (falha.status >= 400 && falha.status < 500) { await apagarRascunho(usuario.id, tipo); }
                throw falha;
            }
            await apagarRascunho(usuario.id, tipo);
            definirMensagem('Operação confirmada.');
            return resultado;
        } catch (falha) {
            definirMensagem(falha.message);
            return null;
        } finally { trava.current = false; definirOcupado(false); }
    }
    async function repetir() {
        try {
            const pedido = await lerRascunho(usuario.id, 'operacao-' + nome);
            if (!pedido) { definirMensagem('Não há envio pendente neste aparelho.'); return null; }
            return await enviar(pedido.caminho, pedido.metodo, JSON.parse(pedido.corpo));
        } catch (falha) { definirMensagem(falha.message); return null; }
    }
    return {
        ocupado,
        mensagem,
        enviar,
        repetir,
    };
}
