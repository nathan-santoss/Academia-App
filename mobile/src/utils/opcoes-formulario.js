const rotulos = {
    true: 'Sim',
    false: 'Não',
    plano: 'Planos',
    modalidade: 'Modalidades',
    diario: 'Diário',
    quinzenal: 'Quinzenal',
    mensal: 'Mensal',
    trimestral: 'Trimestral',
    semestral: 'Semestral',
    anual: 'Anual',
    pix: 'Pix',
    dinheiro: 'Dinheiro',
    debito: 'Cartão de débito',
    credito: 'Cartão de crédito',
    repeticoes: 'Repetições',
    duracao: 'Duração em segundos',
    peso: 'Peso em kg',
    altura: 'Altura em cm',
    cortesia: 'Cortesia',
    funcional: 'Benefício funcional',
    local: 'Local',
    oficial: 'Oficial',
};
export function rotuloOpcao(valor) {
    return rotulos[valor] || valor;
}
