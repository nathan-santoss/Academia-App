import { useCallback, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import HistoricoTreinos from '../components/HistoricoTreinos';
import Botao from '../components/Botao';
import { consultarHistorico } from '../services/treino-servico';
import { estilos } from '../theme/tema';

export default function Evolucao() {
    const [treinos, definirTreinos] = useState([]);
    const [pagina, definirPagina] = useState(0);
    const [erro, definirErro] = useState('');
    const [ocupado, definirOcupado] = useState(false);
    const [atualizacao, definirAtualizacao] = useState(0);
    useFocusEffect(useCallback(function carregar() {
        let ativa = true;
        definirOcupado(true);
        consultarHistorico(pagina).then(function carregou(dados) {
            if (ativa) { definirTreinos(dados); definirErro(''); }
        }).catch(function falhou(falha) {
            if (ativa) { definirErro(falha.message); }
        }).finally(function terminou() {
            if (ativa) { definirOcupado(false); }
        });
        return function sair() { ativa = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Reconsulto a página atual quando o aluno solicita uma atualização.
    }, [pagina, atualizacao]));
    const completos = treinos.filter(function completo(treino) { return treino.estado === 'completo'; }).length;
    return (
        <SafeAreaView
            style={estilos.tela}
            edges={['bottom', 'left', 'right']}
        >
            <ScrollView contentContainerStyle={estilos.conteudo}>
                <Text style={estilos.titulo}>Meu histórico</Text>
                <Text style={estilos.descricao}>Somente sessões confirmadas pelo servidor. Demonstrações são identificadas; séries pendentes aparecem na execução.</Text>
                <Text style={estilos.texto}>{'Nesta página: ' + completos + ' completos e ' + (treinos.length - completos) + ' parciais.'}</Text>
                {Boolean(erro) && <Text style={estilos.erro}>{erro}</Text>}
                <Botao
                    titulo="Atualizar histórico"
                    secundario
                    desabilitado={ocupado}
                    aoPressionar={function atualizar() { definirAtualizacao(atualizacao + 1); }}
                />
                <HistoricoTreinos treinos={treinos} />
                <Botao
                    titulo="Mais recentes"
                    secundario
                    desabilitado={ocupado || pagina === 0}
                    aoPressionar={function anterior() { definirPagina(pagina - 1); }}
                />
                <Botao
                    titulo="Mais antigos"
                    secundario
                    desabilitado={ocupado || treinos.length < 20}
                    aoPressionar={function proxima() { definirPagina(pagina + 1); }}
                />
            </ScrollView>
        </SafeAreaView>
    );
}
