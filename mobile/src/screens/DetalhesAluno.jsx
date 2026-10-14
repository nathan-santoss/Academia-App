// Consulto e apresento somente o cadastro da pessoa que entrou na conta.
// Quando abro esta tela, chamo consultarPerfil sem enviar um ID de aluno. A API descobre o dono pela sessão e devolve
// seus dados; mostro espera, erro com nova tentativa ou o cadastro recebido.

import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Aviso from '../components/Aviso';
import Informacao from '../components/Informacao';
import { consultarPerfil } from '../services/acesso-servico';
import { apresentarData, apresentarStatus, obterIniciais } from '../utils/formatar-aluno';
import { estilos } from '../theme/tema';

// Apresento o perfil da sessão atual e preparo novas tentativas quando a consulta não termina bem.
export default function DetalhesAluno() {
    // Recebo aqui o cadastro retornado pela API para apresentar seus campos. Uso definirAluno para mudar esse estado
    // e pedir ao React que atualize a tela.
    const [aluno, definirAluno] = useState(null);
    // Controlo a espera enquanto os dados ainda não chegaram. Uso definirCarregando para mudar esse estado e pedir ao
    // React que atualize a tela.
    const [carregando, definirCarregando] = useState(true);
    // Reservo a mensagem de falha que será mostrada à pessoa. Uso definirErro para mudar esse estado e pedir ao React
    // que atualize a tela.
    const [erro, definirErro] = useState('');
    // Marco a falha da imagem para poder mostrar as iniciais do aluno. Uso definirFotoIndisponivel para mudar esse
    // estado e pedir ao React que atualize a tela.
    const [fotoIndisponivel, definirFotoIndisponivel] = useState(false);
    // Uso um contador para disparar a consulta do perfil de novo. Uso definirAtualizacao para mudar esse estado e
    // pedir ao React que atualize a tela.
    const [atualizacao, definirAtualizacao] = useState(0);

    // Consulto os dados atuais sempre que este cadastro volta a ficar visível.
    useFocusEffect(useCallback(function carregarAluno() {
        // Inicio telaAtiva com true; vou ajustar esse valor conforme as condições abaixo.
        let telaAtiva = true;

        // Espero os dados do perfil e atualizo a tela apenas se esta consulta ainda pertence à tela aberta.
        async function consultar() {
            // Atualizo carregando no estado; o React usa o novo valor na próxima renderização.
            definirCarregando(true);
            // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
            definirErro('');
            // Atualizo fotoIndisponivel no estado; o React usa o novo valor na próxima renderização.
            definirFotoIndisponivel(false);

            // Tento concluir esta etapa e deixo o catch abaixo receber uma falha, inclusive das chamadas aguardadas
            // com await.
            try {
                // Deixo a API descobrir meu cadastro a partir da sessão, sem enviar um ID.
                const resultado = await consultarPerfil();

                // Descarto a resposta se o usuário já saiu desta tela.
                if (telaAtiva) {
                    // Atualizo aluno no estado; o React usa o novo valor na próxima renderização.
                    definirAluno(resultado.dados);
                } // Encerro a conferência de telaAtiva.
            // Recebo aqui a falha lançada no try para tratar o que não conseguiu terminar.
            } catch (falha) {
                // Confiro se esta consulta ainda pertence à tela aberta antes de usar seu resultado.
                if (telaAtiva) {
                    // Atualizo erro no estado; o React usa o novo valor na próxima renderização.
                    definirErro(falha.message);
                } // Encerro a conferência de telaAtiva.
            // Executo esta limpeza tanto no sucesso quanto na falha para não deixar controles presos.
            } finally {
                // Confiro se esta consulta ainda pertence à tela aberta antes de usar seu resultado.
                if (telaAtiva) {
                    // Atualizo carregando no estado; o React usa o novo valor na próxima renderização.
                    definirCarregando(false);
                } // Encerro a conferência de telaAtiva.
            } // Concluo a etapa de limpeza do finally.
        } // Termino consultar e devolvo o controle a quem chamou.

        // Espero os dados do perfil e atualizo a tela apenas se esta consulta ainda pertence à tela aberta.
        consultar();

        // Devolvo a função de limpeza para o React chamá-la quando este efeito for encerrado.
        return function sairDosDetalhes() {
            // Atualizo telaAtiva com false.
            telaAtiva = false;
        }; // Termino sairDosDetalhes e devolvo o controle a quem chamou.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [atualizacao])); // Incluo o contador para repetir a consulta quando toco em Tentar novamente.

    // Mudo o contador acompanhado pelo hook para disparar uma nova consulta do perfil.
    function tentarNovamente() {
        // Atualizo atualizacao no estado; o React usa o novo valor na próxima renderização.
        definirAtualizacao(atualizacao + 1);
    } // Termino tentarNovamente e devolvo o controle a quem chamou.

    // Marco que a foto falhou para mostrar as iniciais e manter o restante do cadastro legível.
    function avisarFalhaFoto() {
        // Substituo uma foto indisponível pelas iniciais, mantendo o cadastro legível.
        definirFotoIndisponivel(true);
    } // Termino avisarFalhaFoto e devolvo o controle a quem chamou.

    // Escolho entre espera, erro, ausência de cadastro e os dados recebidos, mantendo a decisão fora do JSX
    // principal.
    function apresentarConteudo() {
        // Apresento a espera antes de tentar mostrar dados que ainda não chegaram.
        if (carregando) {
            // Devolvo os componentes que o React deve montar para esta parte da tela.
            return (
                // Monto Aviso para apresentar o texto "Carregando cadastro…" e reaproveitar o comportamento desse
                // componente.
                <Aviso
                    // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não ocupa espaço.
                    mensagem="Carregando cadastro…"
                    // Peço ao Aviso o indicador de atividade enquanto a operação ainda está em andamento.
                    carregando
                // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                />
            ); // Concluo a interface devolvida por esta função para o React montar.
        } // Encerro a conferência de carregando.

        // Escolho a apresentação de falha quando há uma mensagem para mostrar.
        if (erro) {
            // Devolvo os componentes que o React deve montar para esta parte da tela.
            return (
                // Monto Aviso para apresentar erro e reaproveitar o comportamento desse componente.
                <Aviso
                    // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não ocupa espaço.
                    mensagem={erro}
                    // Uso a apresentação de erro para diferenciar esta orientação de uma mensagem comum.
                    erro
                    // Passo a ação de nova tentativa; sem função, o Aviso fica apenas com a mensagem.
                    aoTentar={tentarNovamente}
                // Concluo os atributos de Aviso; este elemento não recebe conteúdo filho.
                />
            ); // Concluo a interface devolvida por esta função para o React montar.
        } // Encerro a conferência de erro.

        // Trato a ausência do cadastro antes de acessar os campos do aluno.
        if (!aluno) {
            // Passo o texto que Aviso vai mostrar; quando ele estiver vazio, o componente não ocupa espaço.
            return <Aviso mensagem="Cadastro não encontrado." />;
        } // Encerro a conferência de aluno.

        // Prefiro as iniciais quando não há foto cadastrada ou ela não pode ser carregada.
        let foto = (
            // Agrupo estes elementos num bloco para aplicar seu layout em conjunto.
            <View style={estilos.avatar}>
                {/* Exibo o resultado de obterIniciais dentro do Text; as chaves levam o valor JavaScript para a
                    tela. */}
                <Text style={estilos.iniciais}>{obterIniciais(aluno.nome)}</Text>
                {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
            </View>
        ); // Concluo o conteúdo visual guardado em foto para inseri-lo mais abaixo na tela.

        // Confiro se a combinação de condições desta linha é atendida antes de executar o bloco abaixo.
        if (aluno.fotoUrl && !fotoIndisponivel) {
            // Troco o conteúdo de foto por uma imagem carregada da URL; mantenho o aviso de falha para voltar às
            // iniciais.
            foto = (
                // Carrego a foto pelo endereço informado e deixo a falha de imagem seguir para o aviso configurado.
                <Image
                    // Passo a origem da imagem que o componente Image vai tentar carregar.
                    source={{
                        // Indico o endereço da foto; o componente de imagem é quem solicita esse recurso.
                        uri: aluno.fotoUrl,
                    }} // Concluo este objeto com os campos que a etapa atual precisa.
                    // Aplico estilos.foto ao Image para aproveitar os estilos compartilhados.
                    style={estilos.foto}
                    // Forneço uma descrição para o leitor de tela identificar a função deste controle.
                    accessibilityLabel={'Foto de ' + aluno.nome}
                    // Ligo uma falha da imagem à função que oferece as iniciais como alternativa visual.
                    onError={avisarFalhaFoto}
                // Concluo os atributos de Image; este elemento não recebe conteúdo filho.
                />
            ); // Concluo o conteúdo visual guardado em foto para inseri-lo mais abaixo na tela.
        } // Encerro a conferência de aluno.fotoUrl.

        // Inicio nomeContato com texto vazio; vou ajustar esse valor conforme as condições abaixo.
        let nomeContato = '';
        // Inicio telefoneContato com texto vazio; vou ajustar esse valor conforme as condições abaixo.
        let telefoneContato = '';

        // Leio o contato opcional apenas quando ele existe no cadastro recebido.
        if (aluno.contatoEmergencia) {
            // Atualizo nomeContato com aluno.contatoEmergencia.nome.
            nomeContato = aluno.contatoEmergencia.nome;
            // Atualizo telefoneContato com aluno.contatoEmergencia.telefone.
            telefoneContato = aluno.contatoEmergencia.telefone;
        } // Encerro a conferência de aluno.contatoEmergencia.

        // Devolvo os componentes que o React deve montar para esta parte da tela.
        return (
            // Agrupo estes elementos num bloco para aplicar seu layout em conjunto.
            <View style={estilos.grupo}>
                {/* Coloco o resultado desta expressão JavaScript dentro do conteúdo visual. */}
                {foto}
                {/* Exibo aluno.matricula dentro do Text; as chaves levam o valor JavaScript para a tela. */}
                <Text style={estilos.etiqueta}>{aluno.matricula}</Text>
                {/* Exibo aluno.nome dentro do Text; as chaves levam o valor JavaScript para a tela. */}
                <Text style={estilos.titulo}>{aluno.nome}</Text>
                {/* Exibo o resultado de apresentarStatus dentro do Text; as chaves levam o valor JavaScript para
                    a tela. */}
                <Text style={estilos.descricao}>{apresentarStatus(aluno.ativo)}</Text>
                {/* Agrupo estes elementos num bloco para aplicar seu layout em conjunto. */}
                <View style={estilos.cartao}>
                    {/* Apresento "Dados pessoais" com Text para explicar esta parte da tela. */}
                    <Text style={estilos.subtitulo}>Dados pessoais</Text>
                    {/* Monto Informacao para apresentar o texto "CPF" e reaproveitar o comportamento desse
                        componente. */}
                    <Informacao
                        // Identifico este campo com o texto "CPF" para a pessoa saber o que preencher ou ler.
                        rotulo="CPF"
                        // Entrego aluno.cpf ao componente Informacao, que mostra o rótulo e trata a ausência de um
                        // dado.
                        valor={aluno.cpf}
                    // Concluo os atributos de Informacao; este elemento não recebe conteúdo filho.
                    />
                    {/* Monto Informacao para apresentar o texto "Data de nascimento" e reaproveitar o
                        comportamento desse componente. */}
                    <Informacao
                        // Identifico este campo com o texto "Data de nascimento" para a pessoa saber o que preencher
                        // ou ler.
                        rotulo="Data de nascimento"
                        // Entrego o resultado de apresentarData ao componente Informacao, que mostra o rótulo e trata
                        // a ausência de um dado.
                        valor={apresentarData(aluno.dataNascimento)}
                    // Concluo os atributos de Informacao; este elemento não recebe conteúdo filho.
                    />
                    {/* Monto Informacao para apresentar o texto "E-mail" e reaproveitar o comportamento desse
                        componente. */}
                    <Informacao
                        // Identifico este campo com o texto "E-mail" para a pessoa saber o que preencher ou ler.
                        rotulo="E-mail"
                        // Entrego aluno.email ao componente Informacao, que mostra o rótulo e trata a ausência de um
                        // dado.
                        valor={aluno.email}
                    // Concluo os atributos de Informacao; este elemento não recebe conteúdo filho.
                    />
                    {/* Monto Informacao para apresentar o texto "Telefone" e reaproveitar o comportamento desse
                        componente. */}
                    <Informacao
                        // Identifico este campo com o texto "Telefone" para a pessoa saber o que preencher ou ler.
                        rotulo="Telefone"
                        // Entrego aluno.telefone ao componente Informacao, que mostra o rótulo e trata a ausência de
                        // um dado.
                        valor={aluno.telefone}
                    // Concluo os atributos de Informacao; este elemento não recebe conteúdo filho.
                    />
                    {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
                </View>
                {/* Agrupo estes elementos num bloco para aplicar seu layout em conjunto. */}
                <View style={estilos.cartao}>
                    {/* Apresento "Contato de emergência" com Text para explicar esta parte da tela. */}
                    <Text style={estilos.subtitulo}>Contato de emergência</Text>
                    {/* Monto Informacao para apresentar o texto "Nome" e reaproveitar o comportamento desse
                        componente. */}
                    <Informacao
                        // Identifico este campo com o texto "Nome" para a pessoa saber o que preencher ou ler.
                        rotulo="Nome"
                        // Entrego nomeContato ao componente Informacao, que mostra o rótulo e trata a ausência de um
                        // dado.
                        valor={nomeContato}
                    // Concluo os atributos de Informacao; este elemento não recebe conteúdo filho.
                    />
                    {/* Monto Informacao para apresentar o texto "Telefone" e reaproveitar o comportamento desse
                        componente. */}
                    <Informacao
                        // Identifico este campo com o texto "Telefone" para a pessoa saber o que preencher ou ler.
                        rotulo="Telefone"
                        // Entrego telefoneContato ao componente Informacao, que mostra o rótulo e trata a ausência de
                        // um dado.
                        valor={telefoneContato}
                    // Concluo os atributos de Informacao; este elemento não recebe conteúdo filho.
                    />
                    {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
                </View>
                {/* Apresento "O status acima se refere ao cadastro. Plano e acesso à academia são informações
                    separadas." com Text para explicar esta parte da tela. */}
                <Text style={estilos.descricao}>O status acima se refere ao cadastro. Plano e acesso à academia são informações separadas.</Text>
                {/* Encerro o conteúdo de View; os próximos elementos ficam fora deste bloco. */}
            </View>
        ); // Concluo a interface devolvida por esta função para o React montar.
    } // Termino apresentarConteudo e devolvo o controle a quem chamou.

    // Devolvo os componentes que o React deve montar para esta parte da tela.
    return (
        // Respeito as bordas reservadas pelo aparelho para os controles não ficarem sob recortes ou barras do
        // sistema.
        <SafeAreaView
            // Aplico estilos.tela ao SafeAreaView para aproveitar os estilos compartilhados.
            style={estilos.tela}
            // Escolho quais bordas respeitam a área segura para o conteúdo não ficar por baixo de recortes ou barras
            // do aparelho.
            edges={['bottom', 'left', 'right']}
        // Concluo os atributos de SafeAreaView e começo seu conteúdo filho.
        >
            {/* Permito rolar o conteúdo quando os campos não cabem na altura disponível. */}
            <ScrollView contentContainerStyle={estilos.conteudo}>
                {/* Coloco o resultado desta expressão JavaScript dentro do conteúdo visual. */}
                {apresentarConteudo()}
                {/* Encerro o conteúdo de ScrollView; os próximos elementos ficam fora deste bloco. */}
            </ScrollView>
            {/* Encerro o conteúdo de SafeAreaView; os próximos elementos ficam fora deste bloco. */}
        </SafeAreaView>
    ); // Concluo a interface devolvida por esta função para o React montar.
} // Termino DetalhesAluno e devolvo o controle a quem chamou.
