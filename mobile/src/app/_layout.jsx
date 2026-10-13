// Organizo a navegação Stack e disponibilizo as preferências para todas as telas.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { cores } from '../theme/tema';
import { PreferenciasProvider } from '../contexts/PreferenciasContext';
import { configurarNotificacoes } from '../services/notificacao-servico';

// Preparo a apresentação dos avisos locais mesmo com o aplicativo aberto.
configurarNotificacoes();

export default function Navegacao() {
    // Compartilho o cabeçalho escuro e deixo o Router cuidar do botão de voltar.
    return (
        <PreferenciasProvider>
            <StatusBar style="light" />
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
                <Stack.Screen
                    name="(menu)"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="alunos/novo"
                    options={{
                        title: 'Novo aluno',
                    }}
                />
                <Stack.Screen
                    name="alunos/[id]"
                    options={{
                        title: 'Detalhes do aluno',
                    }}
                />
                <Stack.Screen
                    name="lembretes/novo"
                    options={{
                        title: 'Novo lembrete',
                    }}
                />
            </Stack>
        </PreferenciasProvider>
    );
}
