// Mostro o resumo de um aluno e permito abrir seu cadastro completo.
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { estilos } from '../theme/tema';
import { obterIniciais, apresentarStatus } from '../utils/formatar-aluno';

export default function CartaoAluno({ aluno }) {
    // Envio somente o ID na navegação; os dados completos serão consultados na API.
    function abrirAluno() {
        router.push({
            pathname: '/alunos/[id]',
            params: {
                id: aluno.id,
            },
        });
    }

    return (
        <Pressable
            style={estilos.cartao}
            onPress={abrirAluno}
            accessibilityRole="button"
            accessibilityLabel={'Consultar ' + aluno.nome + ', matrícula ' + aluno.matricula}
        >
            <View style={estilos.linha}>
                <View style={estilos.avatar}>
                    <Text style={estilos.iniciais}>{obterIniciais(aluno.nome)}</Text>
                </View>
                <View style={[estilos.grupo, estilos.expandir]}>
                    <Text style={estilos.texto}>{aluno.nome}</Text>
                    <Text style={estilos.descricao}>{aluno.matricula}</Text>
                </View>
                <Text
                    style={estilos.iniciais}
                    accessibilityElementsHidden
                >→</Text>
            </View>
            <Text style={estilos.descricao}>{apresentarStatus(aluno.ativo)}</Text>
        </Pressable>
    );
}
