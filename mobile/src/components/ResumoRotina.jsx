import { useState } from 'react';
import { Text, View } from 'react-native';
import Botao from './Botao';
import CampoSelecao from './CampoSelecao';
import { estilos } from '../theme/tema';

export default function ResumoRotina({ rotina, aoIniciar, bloqueado, demonstrativo = false }) {
    const [posicao, definirPosicao] = useState('1');
    if (!rotina) { return null; }
    let origem = 'Pessoal / adaptada pelo aluno';
    if (rotina.origem === 'recomendada') { origem = 'Recomendada pelo instrutor'; }
    let acao = 'Iniciar ';
    if (demonstrativo) { acao = 'Iniciar demonstração · '; }
    const divisoes = rotina.conteudo.divisoes;
    let indice = Number(posicao) - 1;
    if (indice >= divisoes.length) { indice = 0; }
    const divisao = divisoes[indice];
    const opcoes = divisoes.map(function opcao(item, numero) { return String(numero + 1) + ' · ' + item.nome; });
    return (
        <View style={estilos.cartao}>
            <Text style={estilos.etiqueta}>{origem}</Text>
            <Text style={estilos.subtitulo}>{rotina.conteudo.nome}</Text>
            <Text style={estilos.descricao}>{'Versão ' + rotina.versao + ' · ' + new Date(rotina.criadoEm).toLocaleDateString('pt-BR')}</Text>
            <CampoSelecao
                rotulo="Divisão de hoje"
                valor={opcoes[indice]}
                opcoes={opcoes}
                aoAlterar={function selecionar(valor) { definirPosicao(valor.split(' · ')[0]); }}
            />
            {divisao && (
                <View style={estilos.grupo}>
                    {divisao.exercicios.map(function mostrar(item) {
                        let unidade = ' repetições';
                        if (item.tipo === 'duracao') { unidade = ' segundos'; }
                        return (
                            <Text
                                key={item.id}
                                style={estilos.descricao}
                            >{item.nome + ' · ' + item.equipamento + ' · ' + item.series + ' × ' + item.meta + unidade}</Text>
                        );
                    })}
                    <Botao
                        titulo={acao + divisao.nome}
                        desabilitado={bloqueado || !divisao.exercicios.length}
                        aoPressionar={function iniciar() { aoIniciar(rotina, divisao); }}
                    />
                </View>
            )}
        </View>
    );
}
