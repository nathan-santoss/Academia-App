import { setInterval, clearInterval } from 'node:timers';
import { processarUmaEntrega } from '../services/push-servico.js';

export function iniciarEntregasPush() {
    if (process.env.PUSH_HABILITADO !== 'true') {
        return null;
    }
    let ocupado = false;
    const intervalo = setInterval(async function entregar() {
        if (ocupado) {
            return;
        }
        ocupado = true;
        try {
            let quantidade = 0;
            while (quantidade < 10 && await processarUmaEntrega()) {
                quantidade += 1;
            }
        } catch {
            console.warn('Entrega push adiada. As notificações internas permanecem disponíveis.');
        } finally {
            ocupado = false;
        }
    }, 15000);
    intervalo.unref();
    return intervalo;
}

export function encerrarEntregasPush(intervalo) {
    if (intervalo) {
        clearInterval(intervalo);
    }
}
