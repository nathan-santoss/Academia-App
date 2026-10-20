import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { solicitarApi } from '../services/api';

// Descarto respostas de uma consulta anterior quando a tela muda de aluno ou de página.
export default function useConsulta(caminho) {
    const [dados, definirDados] = useState(null);
    const [erro, definirErro] = useState('');
    const [carregando, definirCarregando] = useState(true);
    const [tentativa, definirTentativa] = useState(0);
    useFocusEffect(useCallback(function consultar() {
        let atual = true;
        definirDados(null);
        definirErro('');
        definirCarregando(true);
        if (!caminho) {
            definirCarregando(false);
            return;
        }
        solicitarApi(caminho).then(function recebeu(resultado) {
            if (atual) { definirDados(resultado); }
        }).catch(function falhou(falha) {
            if (atual) { definirErro(falha.message); }
        }).finally(function terminou() {
            if (atual) { definirCarregando(false); }
        });
        return function cancelar() { atual = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- A tentativa permite repetir a mesma consulta.
    }, [caminho, tentativa]));
    function atualizar() { definirTentativa(function somar(valor) { return valor + 1; }); }
    return {
        dados,
        erro,
        carregando,
        atualizar,
    };
}
