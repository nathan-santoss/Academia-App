export function apresentarBeneficio(beneficio, assinatura, funcionario, dia) {
    let estado = 'vigente';
    if (beneficio.revogadoEm) {
        estado = 'revogado';
    } else if (beneficio.fim < dia) {
        estado = 'encerrado';
    } else if (beneficio.origem === 'funcional' && !funcionario) {
        estado = 'sem_vinculo';
    } else if (beneficio.inicio > dia || assinatura && assinatura.vencimento > dia) {
        estado = 'aguardando';
    }
    return Object.assign({}, beneficio.toJSON(), {
        estado: estado,
    });
}
