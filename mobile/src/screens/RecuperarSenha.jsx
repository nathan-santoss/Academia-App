import { useRef, useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import TelaFormulario from '../components/TelaFormulario';
import Botao from '../components/Botao';
import Campo from '../components/Campo';
import { solicitarApi } from '../services/api';
import { senhaNovaValida } from '../utils/validar-senha';
import { estilos } from '../theme/tema';

export default function RecuperarSenha() {
    const [email, definirEmail] = useState('');
    const [codigo, definirCodigo] = useState('');
    const [senha, definirSenha] = useState('');
    const [confirmacao, definirConfirmacao] = useState('');
    const [solicitado, definirSolicitado] = useState(false);
    const [concluido, definirConcluido] = useState(false);
    const [mensagem, definirMensagem] = useState('');
    const [ocupado, definirOcupado] = useState(false);
    const trava = useRef(false);
    async function enviar(confirmar) {
        if (trava.current) { return; }
        if (!email.trim()) { definirMensagem('Informe seu e-mail.'); return; }
        if (confirmar && (!/^\d{6}$/.test(codigo) || !senhaNovaValida(senha) || senha !== confirmacao)) {
            definirMensagem('Confira o código de seis dígitos e duas senhas iguais, com pelo menos oito caracteres.');
            return;
        }
        trava.current = true; definirOcupado(true);
        try {
            let caminho = '/acesso/recuperacao';
            const dados = {
                email: email.trim(),
            };
            if (confirmar) {
                caminho += '/confirmar';
                Object.assign(dados, {
                    codigo: codigo,
                    senha: senha,
                });
            }
            await solicitarApi(caminho, {
                method: 'POST',
                body: JSON.stringify(dados),
            }, false);
            if (confirmar) {
                definirSenha(''); definirConfirmacao(''); definirCodigo(''); definirConcluido(true);
                definirMensagem('Senha alterada. Entre novamente com a nova senha.');
            } else {
                definirSolicitado(true);
                definirMensagem('Se houver uma conta elegível para este e-mail, você receberá o código. Confira também o spam.');
            }
        } catch (falha) { definirMensagem(falha.message); }
        finally { trava.current = false; definirOcupado(false); }
    }
    return (
        <TelaFormulario>
            <Text style={estilos.titulo}>Recuperar acesso</Text>
            <Text
                accessibilityLiveRegion="polite"
                style={estilos.descricao}
            >{mensagem}</Text>
            {!concluido && (
                <Campo
                    rotulo="E-mail da conta"
                    value={email}
                    onChangeText={definirEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    editable={!ocupado && !solicitado}
                />
            )}
            {!concluido && (
                <Botao
                    titulo="Enviar código"
                    desabilitado={ocupado}
                    aoPressionar={function solicitar() { enviar(false); }}
                />
            )}
            {solicitado && !concluido && (
                <Campo
                    rotulo="Código recebido"
                    value={codigo}
                    onChangeText={definirCodigo}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!ocupado}
                />
            )}
            {solicitado && !concluido && (
                <Campo
                    rotulo="Nova senha"
                    value={senha}
                    onChangeText={definirSenha}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!ocupado}
                />
            )}
            {solicitado && !concluido && (
                <Campo
                    rotulo="Repita a nova senha"
                    value={confirmacao}
                    onChangeText={definirConfirmacao}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!ocupado}
                />
            )}
            {solicitado && !concluido && (
                <Botao
                    titulo="Alterar senha"
                    desabilitado={ocupado}
                    aoPressionar={function confirmar() { enviar(true); }}
                />
            )}
            {solicitado && !concluido && (
                <Botao
                    titulo="Usar outro e-mail"
                    secundario
                    desabilitado={ocupado}
                    aoPressionar={function voltar() { definirSolicitado(false); definirCodigo(''); definirSenha(''); definirConfirmacao(''); }}
                />
            )}
            <Botao
                titulo="Voltar ao login"
                secundario
                desabilitado={ocupado}
                aoPressionar={function entrar() { router.replace('/entrar'); }}
            />
        </TelaFormulario>
    );
}
