// Crio uma conta de aluno com dados pessoais e senha, confirmando somente após a resposta da API.
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import Botao from '../components/Botao';
import Campo from '../components/Campo';
import Aviso from '../components/Aviso';
import { criarConta } from '../services/acesso-servico';
import { criarFormularioVazio, prepararCadastro, validarFormulario } from '../utils/validar-cadastro-aluno';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { vibrarAoConcluir } from '../utils/vibracao';
import { preencherData } from '../utils/formatar-data';
import { estilos } from '../theme/tema';

export default function CadastroAluno() {
    const { vibracaoAtiva } = usePreferencias();
    const alturaCabecalho = useHeaderHeight();
    // Guardo o formulário apenas na memória enquanto esta tela está aberta.
    const [formulario, definirFormulario] = useState(criarFormularioVazio);
    const [salvando, definirSalvando] = useState(false);
    const [erro, definirErro] = useState('');
    const [contaCriada, definirContaCriada] = useState(false);
    const [senha, definirSenha] = useState('');
    const [confirmacao, definirConfirmacao] = useState('');
    const envioEmAndamento = useRef(false);
    const telaAberta = useRef(true);
    const rolagem = useRef(null);

    // Deixo de atualizar a tela se a pessoa sair durante a solicitação.
    useEffect(function acompanharTela() {
        telaAberta.current = true;

        return function fecharTela() {
            telaAberta.current = false;
        };
    }, []);

    function alterarCampo(campo, valor) {
        // Acrescento as barras da data para permitir digitação apenas com números.
        if (campo === 'nascimento') {
            valor = preencherData(valor);
        }

        // Atualizo apenas o campo digitado e preservo os demais valores.
        definirFormulario(Object.assign({}, formulario, {
            [campo]: valor,
        }));
    }

    function mostrarErro(mensagem) {
        // Levo o aviso ao início da tela sem apagar o que já foi preenchido.
        definirErro(mensagem);

        if (rolagem.current) {
            rolagem.current.scrollTo({
                y: 0,
                animated: true,
            });
        }
    }

    async function salvar() {
        // Bloqueio toques repetidos imediatamente, antes da próxima renderização.
        if (envioEmAndamento.current || contaCriada) {
            return;
        }

        const mensagem = validarFormulario(formulario);

        if (mensagem) {
            mostrarErro(mensagem);
            return;
        }

        // Confiro a confirmação sem mandar a segunda cópia da senha para a API.
        if (senha.length < 15 || senha.length > 128) {
            mostrarErro('Escolha uma senha de 15 a 128 caracteres. Você pode usar uma frase.');
            return;
        }
        if (senha !== confirmacao) {
            mostrarErro('As senhas não coincidem. Confira os dois campos.');
            return;
        }

        envioEmAndamento.current = true;
        definirSalvando(true);
        definirErro('');

        try {
            const dados = Object.assign({}, prepararCadastro(formulario), {
                senha: senha,
            });
            await criarConta(dados);

            // Confirmo o cadastro somente depois que a API devolve o aluno salvo.
            if (telaAberta.current) {
                definirContaCriada(true);
                definirSenha('');
                definirConfirmacao('');
                // Respeito a preferência compartilhada depois da confirmação do backend.
                vibrarAoConcluir(vibracaoAtiva);
            }
        } catch (falha) {
            if (telaAberta.current) {
                mostrarErro(falha.message);
            }
        } finally {
            envioEmAndamento.current = false;

            if (telaAberta.current) {
                definirSalvando(false);
            }
        }
    }

    function irParaLogin() {
        // Troco o formulário pela entrada para não repetir a criação ao voltar.
        router.replace('/entrar');
    }

    // Confirmo a conta sem abrir uma sessão antes da conferência da senha.
    if (contaCriada) {
        return (
            <SafeAreaView
                style={estilos.tela}
                edges={['bottom', 'left', 'right']}
            >
                <ScrollView contentContainerStyle={estilos.conteudo}>
                    <Text style={estilos.etiqueta}>CADASTRO CONCLUÍDO</Text>
                    <Text style={estilos.titulo}>Tudo pronto!</Text>
                    <View style={estilos.cartao}>
                        <Text style={estilos.subtitulo}>{formulario.nome}</Text>
                        <Text style={estilos.descricao}>Sua conta foi criada. Entre com seu e-mail e sua senha para continuar.</Text>
                    </View>
                    <Botao
                        titulo="Entrar na minha conta"
                        secundario
                        aoPressionar={irParaLogin}
                    />
                </ScrollView>
            </SafeAreaView>
        );
    }

    let textoBotao = 'Criar minha conta';

    if (salvando) {
        textoBotao = 'Salvando cadastro…';
    }

    function campo(rotulo, nome, propriedades = {}) {
        // Reaproveito a ligação entre campo e formulário sem repetir essa lógica no JSX.
        return (
            <Campo
                rotulo={rotulo}
                value={formulario[nome]}
                onChangeText={function atualizarValor(valor) {
                    alterarCampo(nome, valor);
                }}
                editable={!salvando}
                autoCapitalize={propriedades.autoCapitalize}
                autoCorrect={propriedades.autoCorrect}
                keyboardType={propriedades.keyboardType}
                maxLength={propriedades.maxLength}
                placeholder={propriedades.placeholder}
            />
        );
    }

    return (
        <SafeAreaView
            style={estilos.tela}
            edges={['bottom', 'left', 'right']}
        >
            {/* Compenso o teclado no iOS; no Android uso o redimensionamento da janela. */}
            <KeyboardAvoidingView
                style={estilos.tela}
                behavior="padding"
                enabled={Platform.OS === 'ios'}
                keyboardVerticalOffset={alturaCabecalho}
            >
                <ScrollView
                    ref={rolagem}
                    contentContainerStyle={estilos.conteudo}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={estilos.etiqueta}>UM NOVO COMEÇO</Text>
                    <Text style={estilos.titulo}>Crie sua conta</Text>
                    <Text style={estilos.descricao}>Preencha os dados abaixo. O cadastro é destinado a pessoas com 18 anos completos.</Text>
                    <Aviso
                        mensagem={erro}
                        erro
                    />
                    <View style={estilos.grupo}>
                        <Text style={estilos.subtitulo}>01 · Dados pessoais</Text>
                        {campo('Nome completo *', 'nome', {
                            autoCapitalize: 'words',
                            maxLength: 150,
                        })}
                        {campo('CPF *', 'cpf', {
                            keyboardType: 'numeric',
                            maxLength: 14,
                            placeholder: '000.000.000-00',
                        })}
                        {campo('Data de nascimento *', 'nascimento', {
                            keyboardType: 'number-pad',
                            maxLength: 10,
                            placeholder: 'DD/MM/AAAA',
                        })}
                    </View>
                    <View style={estilos.grupo}>
                        <Text style={estilos.subtitulo}>02 · Contato</Text>
                        {campo('E-mail *', 'email', {
                            keyboardType: 'email-address',
                            autoCapitalize: 'none',
                            autoCorrect: false,
                            maxLength: 254,
                        })}
                        {campo('Telefone com DDD *', 'telefone', {
                            keyboardType: 'phone-pad',
                            maxLength: 20,
                            placeholder: '(11) 99999-9999',
                        })}
                    </View>
                    <View style={estilos.grupo}>
                        {/* Peço uma frase longa e escondo a senha durante a digitação. */}
                        <Text style={estilos.subtitulo}>03 · Acesso</Text>
                        <Text style={estilos.descricao}>Escolha uma senha de 15 a 128 caracteres. Use uma frase que consiga lembrar.</Text>
                        <Campo
                            rotulo="Senha *"
                            value={senha}
                            onChangeText={definirSenha}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            maxLength={128}
                            editable={!salvando}
                        />
                        <Campo
                            rotulo="Repita a senha *"
                            value={confirmacao}
                            onChangeText={definirConfirmacao}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            maxLength={128}
                            editable={!salvando}
                        />
                    </View>
                    <View style={estilos.grupo}>
                        <Text style={estilos.subtitulo}>04 · Informações opcionais</Text>
                        <Text style={estilos.descricao}>Você pode deixar estes campos em branco.</Text>
                        {campo('Endereço da foto (HTTPS)', 'fotoUrl', {
                            keyboardType: 'url',
                            autoCapitalize: 'none',
                            autoCorrect: false,
                            maxLength: 2048,
                            placeholder: 'https://...',
                        })}
                        {campo('Nome do contato de emergência', 'contatoNome', {
                            autoCapitalize: 'words',
                            maxLength: 150,
                        })}
                        {campo('Telefone do contato de emergência', 'contatoTelefone', {
                            keyboardType: 'phone-pad',
                            maxLength: 20,
                        })}
                    </View>
                    <Text style={estilos.descricao}>* Campos obrigatórios. A matrícula será gerada ao concluir o cadastro.</Text>
                    <Botao
                        titulo={textoBotao}
                        aoPressionar={salvar}
                        desabilitado={salvando}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
