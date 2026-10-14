// Organizo as telas públicas e pessoais, conferindo a sessão antes de mostrar o menu.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { cores, estilos } from '../theme/tema';
import { PreferenciasProvider } from '../contexts/PreferenciasContext';
import { AcessoProvider, useAcesso } from '../contexts/AcessoContext';
import { configurarNotificacoes } from '../services/notificacao-servico';
import Aviso from '../components/Aviso';

// Preparo os avisos locais sem pedir permissão durante a abertura do aplicativo.
configurarNotificacoes();

function Telas() {
    const acesso = useAcesso();
    // Aguardo a consulta inicial para não piscar dados privados ou uma tela de login desnecessária.
    if (acesso.carregando || acesso.erroInicial) {
        let mensagem = 'Conectando à sua conta…';
        let tentar = null;
        if (acesso.erroInicial) {
            mensagem = acesso.erroInicial;
            tentar = acesso.restaurar;
        }
        return (
            <View style={[estilos.tela, estilos.conteudo]}>
                <Aviso
                    mensagem={mensagem}
                    carregando={acesso.carregando}
                    erro={Boolean(acesso.erroInicial)}
                    aoTentar={tentar}
                />
            </View>
        );
    }

    return (
        <Stack screenOptions={{
            headerStyle: {
                backgroundColor: cores.fundo,
            },
            headerTintColor: cores.texto,
            headerShadowVisible: false,
            contentStyle: {
                backgroundColor: cores.fundo,
            },
        }}
        >
            {/* Retiro também o histórico privado quando a pessoa sai da conta. */}
            <Stack.Protected guard={Boolean(acesso.usuario)}>
                <Stack.Screen
                    name="(menu)"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="lembretes/novo"
                    options={{
                        title: 'Novo lembrete',
                    }}
                />
            </Stack.Protected>
            <Stack.Protected guard={!acesso.usuario}>
                <Stack.Screen
                    name="entrar"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="cadastro"
                    options={{
                        title: 'Criar minha conta',
                    }}
                />
            </Stack.Protected>
        </Stack>
    );
}

export default function Navegacao() {
    // Compartilho preferências e acesso sem repetir essa preparação em cada tela.
    return (
        <PreferenciasProvider>
            <AcessoProvider>
                <StatusBar style="light" />
                <Telas />
            </AcessoProvider>
        </PreferenciasProvider>
    );
}
