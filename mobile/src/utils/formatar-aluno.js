// Preparo iniciais, datas e descrições de status para apresentar os cadastros.
export function obterIniciais(nome) {
    // Uso as primeiras letras do primeiro e do último nome como identificação visual.
    const partes = nome.trim().split(/\s+/);
    let iniciais = partes[0].charAt(0);

    if (partes.length > 1) {
        iniciais += partes[partes.length - 1].charAt(0);
    }

    return iniciais.toUpperCase();
}

export function apresentarStatus(ativo) {
    // Descrevo apenas o cadastro, sem indicar plano pago ou entrada liberada.
    if (ativo) {
        return 'Cadastro ativo';
    }

    return 'Cadastro inativo';
}

export function apresentarData(data) {
    // Reorganizo ano, mês e dia sem converter fuso horário.
    if (!data) {
        return '';
    }

    return data.slice(8, 10) + '/' + data.slice(5, 7) + '/' + data.slice(0, 4);
}
