// Monto o menu inferior com as áreas de alunos, lembretes e preferências.
import { Tabs } from 'expo-router/js-tabs';
import { cores } from '../../theme/tema';

export default function MenuInferior() {
    // Agrupo as três áreas no rodapé; formulários e detalhes continuam no Stack.
    return (
        <Tabs screenOptions={{
            headerStyle: {
                backgroundColor: cores.fundo,
            },
            headerTintColor: cores.texto,
            headerShadowVisible: false,
            tabBarActiveTintColor: cores.destaque,
            tabBarInactiveTintColor: cores.secundario,
            tabBarIconStyle: {
                display: 'none',
            },
            tabBarLabelStyle: {
                fontSize: 14,
                fontWeight: '600',
            },
            tabBarItemStyle: {
                paddingVertical: 10,
            },
            tabBarStyle: {
                backgroundColor: cores.superficie,
                borderTopColor: cores.borda,
            },
            sceneStyle: {
                backgroundColor: cores.fundo,
            },
        }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Alunos',
                }}
            />
            <Tabs.Screen
                name="lembretes"
                options={{
                    title: 'Lembretes',
                }}
            />
            <Tabs.Screen
                name="preferencias"
                options={{
                    title: 'Preferências',
                }}
            />
        </Tabs>
    );
}
