function texto(valor, rotulo, limite) {
    if (typeof valor !== 'string' || !valor.trim() || valor.trim().length > limite) {
        throw new Error(rotulo + ': informe um texto de até ' + limite + ' caracteres.');
    }
    return valor.trim();
}

function numero(valor, rotulo, minimo, maximo, inteiro = true) {
    if (valor === null || valor === undefined || String(valor).trim() === '') {
        throw new Error(rotulo + ': selecione um valor.');
    }
    const convertido = Number(String(valor).replace(',', '.'));
    if (!Number.isFinite(convertido) || convertido < minimo || convertido > maximo || inteiro && !Number.isInteger(convertido)) {
        throw new Error(rotulo + ': use um valor entre ' + minimo + ' e ' + maximo + '.');
    }
    return convertido;
}

// Valido antes do envio e identifico a divisão/exercício para facilitar a correção no formulário.
export function prepararConteudo(formulario) {
    const nome = texto(formulario.nome, 'Nome da rotina', 100);
    if (!formulario.divisoes.length || formulario.divisoes.length > 10) {
        throw new Error('A rotina precisa de 1 a 10 divisões.');
    }
    return {
        nome: nome,
        divisoes: formulario.divisoes.map(function divisao(item, indice) {
            const prefixo = 'Divisão ' + (indice + 1);
            if (!item.exercicios.length || item.exercicios.length > 30) {
                throw new Error(prefixo + ': escolha de 1 a 30 exercícios.');
            }
            return {
                id: item.id,
                nome: texto(item.nome, prefixo + ' / nome', 60),
                exercicios: item.exercicios.map(function exercicio(registro, posicao) {
                    const campo = prefixo + ', exercício ' + (posicao + 1);
                    if (!['repeticoes', 'duracao'].includes(registro.tipo)) {
                        throw new Error(campo + ': escolha repetições ou duração.');
                    }
                    let carga = null;
                    if (registro.carga !== null && registro.carga !== undefined && String(registro.carga).trim() !== '') {
                        carga = numero(registro.carga, campo + ' / carga', 0, 2000, false);
                    }
                    let observacoes = '';
                    if (registro.observacoes && registro.observacoes.trim()) {
                        observacoes = texto(registro.observacoes, campo + ' / observações', 500);
                    }
                    const resultado = {
                        id: registro.id,
                        nome: texto(registro.nome, campo + ' / nome', 100),
                        equipamento: texto(registro.equipamento, campo + ' / equipamento', 100),
                        referenciaCarga: texto(registro.referenciaCarga, campo + ' / referência da carga', 60),
                        tipo: registro.tipo,
                        series: numero(registro.series, campo + ' / séries', 1, 20),
                        meta: numero(registro.meta, campo + ' / meta', 1, 36000),
                        carga: carga,
                        descanso: numero(registro.descanso, campo + ' / descanso', 0, 3600),
                        observacoes: observacoes,
                    };
                    if (registro.exercicioCatalogoId) {
                        resultado.exercicioCatalogoId = registro.exercicioCatalogoId;
                    }
                    return resultado;
                }),
            };
        }),
    };
}
