export function nomeDivisao(divisao, indice) {
    if (divisao.nome && divisao.nome.trim()) { return divisao.nome; }
    return 'Treino ' + String.fromCharCode(65 + indice);
}

export function sugerirNomeDivisao(divisoes) {
    const letras = 'ABCDEFGHIJ'.split('');
    const nomes = divisoes.map(nomeDivisao);
    const letra = letras.find(function disponivel(item) {
        return !nomes.includes('Treino ' + item);
    });
    if (letra) { return 'Treino ' + letra; }
    return 'Novo treino';
}

export function completarNomesRotina(rotina) {
    let nome = rotina.nome;
    if (!nome || !nome.trim()) { nome = 'Minha rotina'; }
    return Object.assign({}, rotina, {
        nome: nome.trim(),
        divisoes: rotina.divisoes.map(function completar(divisao, indice) {
            return Object.assign({}, divisao, {
                nome: nomeDivisao(divisao, indice).trim(),
            });
        }),
    });
}

function inteiroValido(valor, minimo, maximo) {
    const texto = String(valor).trim();
    return /^\d+$/.test(texto) && Number(texto) >= minimo && Number(texto) <= maximo;
}

export function erroExercicio(exercicio) {
    if (!exercicio.nome.trim() || exercicio.nome.trim().length > 100) { return 'Informe um nome de até 100 caracteres.'; }
    if (!exercicio.equipamento.trim() || exercicio.equipamento.trim().length > 100) { return 'Escolha o equipamento ou peso corporal.'; }
    if (!exercicio.referenciaCarga.trim() || exercicio.referenciaCarga.trim().length > 60) { return 'Informe a referência da carga (até 60 caracteres).'; }
    if (!['repeticoes', 'duracao'].includes(exercicio.tipo)) { return 'Escolha repetições ou duração.'; }
    if (!inteiroValido(exercicio.series, 1, 20)) { return 'Escolha de 1 a 20 séries inteiras.'; }
    if (!inteiroValido(exercicio.meta, 1, 36000)) { return 'Informe repetições ou segundos inteiros entre 1 e 36000.'; }
    if (!inteiroValido(exercicio.descanso, 0, 3600)) { return 'Escolha o descanso entre 0 e 3600 segundos.'; }
    if (exercicio.carga !== null && String(exercicio.carga).trim() !== '') {
        const carga = String(exercicio.carga).trim().replace(',', '.');
        if (!/^\d+(\.\d+)?$/.test(carga) || Number(carga) > 2000) { return 'Informe uma carga entre 0 e 2000 kg ou deixe em branco.'; }
    }
    if (exercicio.observacoes && exercicio.observacoes.trim().length > 500) { return 'Use até 500 caracteres nas observações.'; }
    return '';
}

export function erroRotina(rotina) {
    const formulario = completarNomesRotina(rotina);
    if (formulario.nome.length > 100) { return 'Use até 100 caracteres no nome da rotina.'; }
    if (formulario.divisoes.length < 1 || formulario.divisoes.length > 10) { return 'Adicione de 1 a 10 treinos.'; }
    let erro = '';
    formulario.divisoes.some(function conferir(divisao) {
        if (divisao.nome.length > 60) { erro = 'Use até 60 caracteres no nome do treino.'; }
        else if (divisao.exercicios.length < 1) { erro = divisao.nome + ': adicione pelo menos um exercício ou exclua esse treino.'; }
        else if (divisao.exercicios.length > 30) { erro = divisao.nome + ': use até 30 exercícios.'; }
        else {
            divisao.exercicios.some(function conferirExercicio(exercicio) {
                const aviso = erroExercicio(exercicio);
                if (aviso) { erro = divisao.nome + ' • ' + exercicio.nome + ': ' + aviso; }
                return Boolean(erro);
            });
        }
        return Boolean(erro);
    });
    return erro;
}

export function resumoExercicio(exercicio) {
    let unidade = ' repetições';
    if (exercicio.tipo === 'duracao') { unidade = ' segundos'; }
    let resumo = exercicio.series + ' × ' + exercicio.meta + unidade;
    if (exercicio.carga !== null && String(exercicio.carga).trim() !== '') {
        resumo += ' • ' + exercicio.carga + ' kg';
    }
    return resumo + ' • descanso ' + exercicio.descanso + 's';
}

// Mantenho a identidade do exercício ao editar e aceito repetições como itens distintos.
export function aplicarExercicio(rotina, divisaoId, exercicio, novo) {
    const divisao = rotina.divisoes.find(function encontrar(item) { return item.id === divisaoId; });
    if (!divisao) { throw new Error('Este treino não está mais disponível. Abra a rotina novamente.'); }
    let exercicios = divisao.exercicios.slice();
    if (novo) {
        if (exercicios.length >= 30) { throw new Error('Use até 30 exercícios por treino.'); }
        if (exercicios.some(function existe(item) { return item.id === exercicio.id; })) { return rotina; }
        exercicios = exercicios.concat(exercicio);
    } else {
        const indice = exercicios.findIndex(function encontrar(item) { return item.id === exercicio.id; });
        if (indice < 0) { throw new Error('Este exercício foi removido. Abra o treino novamente.'); }
        exercicios[indice] = exercicio;
    }
    return Object.assign({}, rotina, {
        divisoes: rotina.divisoes.map(function atualizar(item) {
            if (item.id !== divisaoId) { return item; }
            return Object.assign({}, item, {
                exercicios: exercicios,
            });
        }),
    });
}

export function reposicionarItem(lista, origem, destino) {
    if (origem < 0 || origem >= lista.length || destino < 0 || destino >= lista.length) { return lista; }
    const copia = lista.slice();
    const item = copia.splice(origem, 1)[0];
    copia.splice(destino, 0, item);
    return copia;
}
