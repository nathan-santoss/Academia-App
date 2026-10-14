// Apresento o login e o caminho para criar uma conta pessoal na academia.
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAcesso } from '../contexts/AcessoContext';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import BotaoLink from '../components/BotaoLink';
import Aviso from '../components/Aviso';
import { estilos } from '../theme/tema';

export default function Entrar() {
    const acesso = useAcesso();
    const [email, definirEmail] = useState('');
    const [senha, definirSenha] = useState('');
    const [erro, definirErro] = useState('');
    const [enviando, definirEnviando] = useState(false);
    const envioEmAndamento = useRef(false);

    async function entrar() {
        // Evito dois logins ao mesmo tempo quando a pessoa toca rápido no botão.
        if (envioEmAndamento.current) {
            return;
        }
        if (!email.trim() || !senha) {
            definirErro('Preencha seu e-mail e sua senha.');
            return;
        }
        envioEmAndamento.current = true;
        definirEnviando(true);
        definirErro('');
        try {
            await acesso.entrar(email.trim(), senha);
            // Limpo a senha da memória da tela depois de entrar.
            definirSenha('');
        } catch (falha) {
            definirErro(falha.message);
        } finally {
            envioEmAndamento.current = false;
            definirEnviando(false);
        }
    }

    let tituloBotao = 'Entrar';
    if (enviando) {
        tituloBotao = 'Conectando…';
    }

    return (
        <SafeAreaView style={estilos.tela}>
            <KeyboardAvoidingView
                style={estilos.tela}
                behavior="padding"
                enabled={Platform.OS === 'ios'}
            >
                <ScrollView
                    contentContainerStyle={estilos.conteudo}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={estilos.etiqueta}>ACADEMIA APP</Text>
                    <Text style={estilos.titulo}>Seu espaço na academia</Text>
                    <Text style={estilos.descricao}>Entre para consultar seu cadastro e organizar seus lembretes.</Text>
                    <Aviso mensagem={acesso.aviso} />
                    <Aviso
                        mensagem={erro}
                        erro
                    />
                    <Campo
                        rotulo="E-mail"
                        value={email}
                        onChangeText={definirEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={254}
                        editable={!enviando}
                    />
                    <Campo
                        rotulo="Senha"
                        value={senha}
                        onChangeText={definirSenha}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={128}
                        editable={!enviando}
                        onSubmitEditing={entrar}
                        returnKeyType="go"
                    />
                    <Botao
                        titulo={tituloBotao}
                        aoPressionar={entrar}
                        desabilitado={enviando}
                    />
                    {!enviando && (
                        <BotaoLink
                            titulo="Criar minha conta"
                            destino="/cadastro"
                        />
                    )}
                    <Text style={estilos.descricao}>Use uma conexão com a internet. O primeiro acesso pode levar até um minuto enquanto o servidor inicia.</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
