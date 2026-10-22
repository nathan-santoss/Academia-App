import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import TelaFormulario from '../components/TelaFormulario';
import EstadoConsulta from '../components/EstadoConsulta';
import Paginacao from '../components/Paginacao';
import Botao from '../components/Botao';
import useConsulta from '../hooks/useConsulta';
import { useAcesso } from '../contexts/AcessoContext';
import { solicitarApi } from '../services/api';
import { ativarPush, desativarPush } from '../services/push-servico';
import { estilos } from '../theme/tema';

export default function Notificacoes() {
    const { usuario } = useAcesso();
    const [pagina, definirPagina] = useState(0);
    const [mensagem, definirMensagem] = useState('');
    const [ocupado, definirOcupado] = useState(false);
    const trava = useRef(false);
    const consulta = useConsulta('/notificacoes?pagina=' + pagina);
    const avisos = consulta.dados || [];
    async function executar(acao) {
        if (trava.current) { return; }
        trava.current = true; definirOcupado(true);
        try { await acao(); }
        catch (falha) { definirMensagem(falha.message); }
        finally { trava.current = false; definirOcupado(false); }
    }
    function abrir(item) {
        executar(async function ler() {
            await solicitarApi('/notificacoes/' + item.id + '/lida', {
                method: 'PUT',
            });
            consulta.atualizar();
            // Traduzo somente destinos conhecidos; o servidor não escolhe uma rota arbitrária do aplicativo.
            if (item.destino.startsWith('/financeiro')) { router.push('/financeiro'); }
            else if (item.destino.startsWith('/treinos')) { router.push('/'); }
            else { definirMensagem('Notificação marcada como lida.'); }
        });
    }
    return (
        <TelaFormulario>
            <Text style={estilos.titulo}>Notificações da academia</Text>
            <Text style={estilos.descricao}>Os avisos ficam disponíveis aqui mesmo sem permitir notificações no aparelho. Ative novamente após entrar em uma nova sessão.</Text>
            <Botao
                titulo="Ativar avisos neste aparelho"
                secundario
                desabilitado={ocupado}
                aoPressionar={function ativar() { executar(async function registrar() { await ativarPush(usuario.id); definirMensagem('Dispositivo registrado para esta sessão.'); }); }}
            />
            <Botao
                titulo="Desativar avisos deste aparelho"
                secundario
                desabilitado={ocupado}
                aoPressionar={function desativar() { executar(async function remover() { await desativarPush(usuario.id); definirMensagem('Dispositivo removido. Os avisos continuam disponíveis nesta central.'); }); }}
            />
            {Boolean(mensagem) && (
                <Text
                    accessibilityLiveRegion="polite"
                    style={estilos.descricao}
                >{mensagem}</Text>
            )}
            <EstadoConsulta consulta={consulta} />
            {!consulta.carregando && !consulta.erro && !avisos.length && (
                <Text style={estilos.descricao}>Nenhuma notificação nesta página.</Text>
            )}
            {avisos.map(function mostrar(item) {
                return (
                    <View
                        key={item.id}
                        style={estilos.cartao}
                    >
                        {!item.lidaEm && (
                            <Text style={estilos.etiqueta}>NOVA</Text>
                        )}
                        <Text style={estilos.texto}>{item.mensagem}</Text>
                        <Text style={estilos.descricao}>{new Date(item.criadoEm).toLocaleString('pt-BR')}</Text>
                        <Botao
                            titulo="Ler e consultar"
                            secundario
                            desabilitado={ocupado}
                            aoPressionar={function selecionar() { abrir(item); }}
                        />
                    </View>
                );
            })}
            <Paginacao
                pagina={pagina}
                quantidade={avisos.length}
                ocupado={consulta.carregando || ocupado}
                aoAlterar={definirPagina}
            />
        </TelaFormulario>
    );
}
