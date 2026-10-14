// Disponibilizo o ajuste de vibração e apresento informações básicas do dispositivo.
import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { consultarDispositivo } from '../services/dispositivo-servico';
import Aviso from '../components/Aviso';
import Informacao from '../components/Informacao';
import { cores, estilos } from '../theme/tema';
import { useAcesso } from '../contexts/AcessoContext';
import Botao from '../components/Botao';

export default function Preferencias() {
    const preferencias = usePreferencias();
    const acesso = useAcesso();
    const [saindo, definirSaindo] = useState(false);
    const [erroSaida, definirErroSaida] = useState('');
    const [dispositivo, definirDispositivo] = useState(null);
    const [erroDispositivo, definirErroDispositivo] = useState('');

    async function sair() {
        // Espero a confirmação da API para encerrar também a credencial no servidor.
        definirSaindo(true);
        definirErroSaida('');
        try {
            await acesso.sair();
        } catch (falha) {
            definirErroSaida(falha.message);
        } finally {
            definirSaindo(false);
        }
    }

    // Consulto as informações uma vez, sem enviá-las à API ou ao banco de alunos.
    useEffect(function carregarDispositivo() {
        let telaAtiva = true;

        async function carregar() {
            try {
                const dados = await consultarDispositivo();

                if (telaAtiva) {
                    definirDispositivo(dados);
                }
            } catch {
                if (telaAtiva) {
                    definirErroDispositivo('Não foi possível consultar as informações deste aparelho.');
                }
            }
        }

        carregar();

        return function sairDaTela() {
            telaAtiva = false;
        };
    }, []);

    let mensagemPreferencia = '';

    if (preferencias.carregando) {
        mensagemPreferencia = 'Recuperando sua preferência…';
    } else if (preferencias.salvando) {
        mensagemPreferencia = 'Salvando sua escolha…';
    }

    return (
        <SafeAreaView
            style={estilos.tela}
            edges={['left', 'right']}
        >
            <ScrollView contentContainerStyle={estilos.conteudo}>
                <Text style={estilos.etiqueta}>DO SEU JEITO</Text>
                <Text style={estilos.titulo}>Sobre o aplicativo</Text>
                <Text style={estilos.descricao}>Academia App · Meu perfil e lembretes pessoais. Seus dados ficam no banco online da academia.</Text>
                <Aviso mensagem={acesso.aviso} />
                <Aviso
                    mensagem={erroSaida}
                    erro
                />
                <Botao
                    titulo="Sair da minha conta"
                    aoPressionar={sair}
                    desabilitado={saindo}
                    secundario
                />
                {saindo && (
                    <Aviso
                        mensagem="Encerrando acesso…"
                        carregando
                    />
                )}
                <View style={estilos.cartao}>
                    <View style={estilos.linha}>
                        <Text style={[estilos.texto, estilos.expandir]}>Vibrar ao concluir cadastro</Text>
                        <Switch
                            accessibilityLabel="Vibrar ao concluir cadastro"
                            value={preferencias.vibracaoAtiva}
                            onValueChange={preferencias.alterarVibracao}
                            disabled={preferencias.carregando || preferencias.salvando}
                            trackColor={{
                                false: cores.borda,
                                true: cores.destaque,
                            }}
                        />
                    </View>
                    <Text style={estilos.descricao}>Receba uma confirmação pelo toque ao criar sua conta ou salvar um lembrete. Sua escolha fica guardada neste aparelho.</Text>
                </View>
                <Aviso
                    mensagem={mensagemPreferencia}
                    carregando
                />
                <Aviso
                    mensagem={preferencias.erro}
                    erro
                />
                <Text style={estilos.subtitulo}>Sobre este aparelho</Text>
                <Aviso
                    mensagem={erroDispositivo}
                    erro
                />
                {!dispositivo && !erroDispositivo && (
                    <Aviso
                        mensagem="Consultando aparelho…"
                        carregando
                    />
                )}
                {dispositivo && (
                    <View style={estilos.cartao}>
                        <Informacao
                            rotulo="Sistema operacional"
                            valor={dispositivo.sistema}
                        />
                        <Informacao
                            rotulo="Versão do sistema"
                            valor={dispositivo.versao}
                        />
                        <Informacao
                            rotulo="Marca"
                            valor={dispositivo.marca}
                        />
                        <Informacao
                            rotulo="Modelo"
                            valor={dispositivo.modelo}
                        />
                        <Informacao
                            rotulo="Tipo"
                            valor={dispositivo.tipo}
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
