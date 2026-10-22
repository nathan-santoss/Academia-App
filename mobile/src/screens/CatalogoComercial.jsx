import { useState } from 'react';
import { Text, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import TelaFormulario from '../components/TelaFormulario';
import Campo from '../components/Campo';
import CampoSelecao from '../components/CampoSelecao';
import Botao from '../components/Botao';
import EstadoConsulta from '../components/EstadoConsulta';
import EnvioPendente from '../components/EnvioPendente';
import useConsulta from '../hooks/useConsulta';
import useGravacao from '../hooks/useGravacao';
import { moeda } from '../utils/apresentar-dados';
import { estilos } from '../theme/tema';

export default function CatalogoComercial() {
    const [categoria, definirCategoria] = useState('plano');
    const [item, definirItem] = useState(null);
    const [preco, definirPreco] = useState('');
    const [erro, definirErro] = useState('');
    const consulta = useConsulta('/catalogo/' + categoria);
    const papeis = useConsulta('/equipe/papeis');
    const gravacao = useGravacao('catalogo-comercial');
    let lista = [];
    if (consulta.dados) { lista = consulta.dados.dados; }
    function editar(nome, valor) { definirItem(Object.assign({}, item, {
        [nome]: valor,
    })); }
    function atualizado() { definirItem(null); consulta.atualizar(); }
    async function salvar() {
        const valor = Number(preco.replace(',', '.'));
        if (!preco.trim() || !Number.isFinite(valor) || valor < 0 || Math.abs(valor * 100 - Math.round(valor * 100)) > 0.00001) {
            definirErro('Informe um preço válido, com até duas casas decimais.'); return;
        }
        definirErro('');
        const dados = {
            nome: item.nome,
            precoCentavos: Math.round(valor * 100),
            ativo: item.ativo,
        };
        if (categoria === 'plano') { Object.assign(dados, {
            periodo: item.periodo,
        }); }
        if (item.atualizadoEm) { Object.assign(dados, {
            versaoAnterior: item.atualizadoEm,
        }); }
        const resultado = await gravacao.enviar('/catalogo/' + categoria + '/' + item.id, 'PUT', dados);
        if (resultado) { atualizado(); }
    }
    if (!papeis.dados || !papeis.dados.includes('gestao')) {
        return (
            <TelaFormulario>
                <Text style={estilos.descricao}>{papeis.erro || 'Esta área exige o papel Gestão.'}</Text>

                <EstadoConsulta consulta={papeis} />
            </TelaFormulario>
        );
    }
    return (
        <TelaFormulario>
            <Text style={estilos.titulo}>Planos e modalidades</Text>
            {!item && (
                <CampoSelecao
                    rotulo="Catálogo"
                    valor={categoria}
                    opcoes={['plano', 'modalidade']}
                    aoAlterar={definirCategoria}
                />
            )}
            {!item && (
                <Botao
                    titulo="Criar item"
                    aoPressionar={function criar() { definirItem({
                        id: randomUUID(),
                        nome: '',
                        ativo: true,
                        periodo: 'mensal',
                    }); definirPreco(''); }}
                />
            )}
            {item && (
                <View style={estilos.grupo}>
                    <Campo
                        rotulo="Nome"
                        value={item.nome}
                        onChangeText={function nome(valor) { editar('nome', valor); }}
                        maxLength={100}
                        editable={!gravacao.ocupado}
                    />
                    <Campo
                        rotulo="Preço em reais"
                        value={preco}
                        onChangeText={definirPreco}
                        keyboardType="decimal-pad"
                        editable={!gravacao.ocupado}
                    />
                    {categoria === 'plano' && (
                        <CampoSelecao
                            rotulo="Período"
                            valor={item.periodo}
                            opcoes={['diario', 'quinzenal', 'mensal', 'trimestral', 'semestral', 'anual']}
                            aoAlterar={function periodo(valor) { editar('periodo', valor); }}
                        />
                    )}
                    <CampoSelecao
                        rotulo="Disponibilidade"
                        valor={String(item.ativo)}
                        opcoes={['true', 'false']}
                        aoAlterar={function disponibilidade(valor) { editar('ativo', valor === 'true'); }}
                    />
                    {Boolean(erro) && (
                        <Text style={estilos.erro}>{erro}</Text>
                    )}
                    <Botao
                        titulo="Salvar catálogo"
                        desabilitado={gravacao.ocupado}
                        aoPressionar={salvar}
                    />
                    <Botao
                        titulo="Fechar edição e consultar lista"
                        secundario
                        desabilitado={gravacao.ocupado}
                        aoPressionar={function cancelar() { definirItem(null); consulta.atualizar(); }}
                    />
                </View>
            )}
            <EnvioPendente
                gravacao={gravacao}
                aoConfirmar={atualizado}
            />
            {!item && (
                <EstadoConsulta consulta={consulta} />
            )}
            {!item && lista.map(function mostrar(registro) {
                let estado = 'Ativo';
                if (!registro.ativo) { estado = 'Inativo'; }
                return (
                    <View
                        key={registro.id}
                        style={estilos.cartao}
                    >
                        <Text style={estilos.texto}>{registro.nome + ' · ' + moeda(registro.precoCentavos) + ' · ' + estado}</Text>
                        <Botao
                            titulo="Editar"
                            secundario
                            aoPressionar={function abrir() { definirItem(registro); definirPreco(String(registro.precoCentavos / 100)); }}
                        />
                    </View>
                );
            })}
        </TelaFormulario>
    );
}
