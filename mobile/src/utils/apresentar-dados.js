export function moeda(centavos) {
    return (centavos / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}
export function dataDia(dia) {
    if (!dia) { return 'Não informado'; }
    return dia.slice(0, 10).split('-').reverse().join('/');
}
export function hojeAcademia() {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());
}
export function inicioPeriodo(dias) {
    const data = new Date(hojeAcademia() + 'T12:00:00Z');
    data.setUTCDate(data.getUTCDate() - dias);
    return data.toISOString().slice(0, 10);
}
export function nomeEstado(estado) {
    const nomes = {
        suspensa: 'Cobertura suspensa',
        sem_cobertura: 'Sem cobertura atual',
        vigente: 'Período pago vigente',
        tolerancia: 'Tolerância gratuita',
        vencida: 'Cobertura encerrada',
        vencido: 'Cobertura encerrada',
        sem_assinatura: 'Sem assinatura',
        ausente: 'Sem assinatura',
        cortesia: 'Cortesia vigente',
        funcional: 'Benefício funcional vigente',
    };
    return nomes[estado] || estado;
}
