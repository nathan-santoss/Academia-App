// Mostro ao instrutor os treinos que o aluno já encerrou e confirmou no servidor.
// Separo esta consulta da edição da ficha para atualizar o histórico sem perder o que está sendo escrito.
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Botao from './Botao';
import ResumoEvolucao from './ResumoEvolucao';
import MedidasCompartilhadas from './MedidasCompartilhadas';
import HistoricoTreinos from './HistoricoTreinos';
import { consultarExecucoes } from '../services/equipe-servico';
import { estilos } from '../theme/tema';

export default function AcompanhamentoAluno({ alunoId }) {
    const [treinos, definirTreinos] = useState([]);
    const [pagina, definirPagina] = useState(0);
    const [atualizacao, definirAtualizacao] = useState(0);
    const [ocupado, definirOcupado] = useState(true);
    const [erro, definirErro] = useState('');

    useEffect(function carregar() {
        // Descarto uma resposta atrasada quando o instrutor troca de aluno ou de página.
        let ativa = true;
        consultarExecucoes(alunoId, pagina).then(function apresentar(dados) {
            if (ativa) {
                definirTreinos(dados);
            }
        }).catch(function avisar(falha) {
            if (ativa) {
                definirErro(falha.message);
            }
        }).finally(function liberar() {
            if (ativa) {
                definirOcupado(false);
            }
        });

        return function sair() {
            ativa = false;
        };
    // Refaço a consulta também quando o instrutor pede uma atualização da mesma página.
    }, [alunoId, pagina, atualizacao]);

    function abrirPagina(numero) {
        // Limpo a lista no clique para não mostrar dados antigos com o número de uma página nova.
        definirOcupado(true);
        definirErro('');
        definirTreinos([]);
        definirPagina(numero);
    }

    function atualizar() {
        // Volto aos mais recentes para encontrar um treino que acabou de ser enviado pelo aluno.
        abrirPagina(0);
        definirAtualizacao(atualizacao + 1);
    }

    return (
        <View style={estilos.grupo}>
            <Text style={estilos.subtitulo}>Acompanhamento do aluno</Text>
            <ResumoEvolucao alunoId={alunoId} />
            <MedidasCompartilhadas alunoId={alunoId} />
            <Text style={estilos.descricao}>Confira o que foi planejado e o que foi realizado. Treinos ainda em andamento ou sem sincronizar não aparecem neste histórico.</Text>
            <Botao
                titulo="Atualizar acompanhamento"
                secundario
                desabilitado={ocupado}
                aoPressionar={atualizar}
            />
            {ocupado && (
                <Text style={estilos.descricao}>Consultando treinos…</Text>
            )}
            {Boolean(erro) && (
                <Text style={estilos.erro}>{erro}</Text>
            )}
            {!ocupado && !erro && (
                <HistoricoTreinos treinos={treinos} />
            )}
            <Text style={estilos.descricao}>{'Página ' + (pagina + 1)}</Text>
            <Botao
                titulo="Mais recentes"
                secundario
                desabilitado={ocupado || pagina === 0}
                aoPressionar={function voltar() { abrirPagina(pagina - 1); }}
            />
            <Botao
                titulo="Mais antigos"
                secundario
                desabilitado={ocupado || Boolean(erro) || treinos.length < 20}
                aoPressionar={function avancar() { abrirPagina(pagina + 1); }}
            />
        </View>
    );
}
