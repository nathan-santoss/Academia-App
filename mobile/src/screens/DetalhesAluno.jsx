// Consulto e apresento somente o cadastro da pessoa que entrou na conta.
import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Aviso from '../components/Aviso';
import Informacao from '../components/Informacao';
import { consultarPerfil } from '../services/acesso-servico';
import { apresentarData, apresentarStatus, obterIniciais } from '../utils/formatar-aluno';
import { estilos } from '../theme/tema';

export default function DetalhesAluno() {
    const [aluno, definirAluno] = useState(null);
    const [carregando, definirCarregando] = useState(true);
    const [erro, definirErro] = useState('');
    const [fotoIndisponivel, definirFotoIndisponivel] = useState(false);
    const [atualizacao, definirAtualizacao] = useState(0);

    // Consulto os dados atuais sempre que este cadastro volta a ficar visível.
    useFocusEffect(useCallback(function carregarAluno() {
        let telaAtiva = true;

        async function consultar() {
            definirCarregando(true);
            definirErro('');
            definirFotoIndisponivel(false);

            try {
                // Deixo a API descobrir meu cadastro a partir da sessão, sem enviar um ID.
                const resultado = await consultarPerfil();

                // Descarto a resposta se o usuário já saiu desta tela.
                if (telaAtiva) {
                    definirAluno(resultado.dados);
                }
            } catch (falha) {
                if (telaAtiva) {
                    definirErro(falha.message);
                }
            } finally {
                if (telaAtiva) {
                    definirCarregando(false);
                }
            }
        }

        consultar();

        return function sairDosDetalhes() {
            telaAtiva = false;
        };
        // Incluo o contador para repetir a consulta quando toco em Tentar novamente.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [atualizacao]));

    function tentarNovamente() {
        definirAtualizacao(atualizacao + 1);
    }

    function avisarFalhaFoto() {
        // Substituo uma foto indisponível pelas iniciais, mantendo o cadastro legível.
        definirFotoIndisponivel(true);
    }

    function apresentarConteudo() {
        if (carregando) {
            return (
                <Aviso
                    mensagem="Carregando cadastro…"
                    carregando
                />
            );
        }

        if (erro) {
            return (
                <Aviso
                    mensagem={erro}
                    erro
                    aoTentar={tentarNovamente}
                />
            );
        }

        if (!aluno) {
            return <Aviso mensagem="Cadastro não encontrado." />;
        }

        // Prefiro as iniciais quando não há foto cadastrada ou ela não pode ser carregada.
        let foto = (
            <View style={estilos.avatar}>
                <Text style={estilos.iniciais}>{obterIniciais(aluno.nome)}</Text>
            </View>
        );

        if (aluno.fotoUrl && !fotoIndisponivel) {
            foto = (
                <Image
                    source={{
                        uri: aluno.fotoUrl,
                    }}
                    style={estilos.foto}
                    accessibilityLabel={'Foto de ' + aluno.nome}
                    onError={avisarFalhaFoto}
                />
            );
        }

        let nomeContato = '';
        let telefoneContato = '';

        if (aluno.contatoEmergencia) {
            nomeContato = aluno.contatoEmergencia.nome;
            telefoneContato = aluno.contatoEmergencia.telefone;
        }

        return (
            <View style={estilos.grupo}>
                {foto}
                <Text style={estilos.etiqueta}>{aluno.matricula}</Text>
                <Text style={estilos.titulo}>{aluno.nome}</Text>
                <Text style={estilos.descricao}>{apresentarStatus(aluno.ativo)}</Text>
                <View style={estilos.cartao}>
                    <Text style={estilos.subtitulo}>Dados pessoais</Text>
                    <Informacao
                        rotulo="CPF"
                        valor={aluno.cpf}
                    />
                    <Informacao
                        rotulo="Data de nascimento"
                        valor={apresentarData(aluno.dataNascimento)}
                    />
                    <Informacao
                        rotulo="E-mail"
                        valor={aluno.email}
                    />
                    <Informacao
                        rotulo="Telefone"
                        valor={aluno.telefone}
                    />
                </View>
                <View style={estilos.cartao}>
                    <Text style={estilos.subtitulo}>Contato de emergência</Text>
                    <Informacao
                        rotulo="Nome"
                        valor={nomeContato}
                    />
                    <Informacao
                        rotulo="Telefone"
                        valor={telefoneContato}
                    />
                </View>
                <Text style={estilos.descricao}>O status acima se refere ao cadastro. Plano e acesso à academia são informações separadas.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView
            style={estilos.tela}
            edges={['bottom', 'left', 'right']}
        >
            <ScrollView contentContainerStyle={estilos.conteudo}>
                {apresentarConteudo()}
            </ScrollView>
        </SafeAreaView>
    );
}
