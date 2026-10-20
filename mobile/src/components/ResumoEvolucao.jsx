import { useState } from 'react';
import { Text, View } from 'react-native';
import CampoSelecao from './CampoSelecao';
import Campo from './Campo';
import Botao from './Botao';
import EstadoConsulta from './EstadoConsulta';
import Paginacao from './Paginacao';
import useConsulta from '../hooks/useConsulta';
import { dataDia, hojeAcademia, inicioPeriodo } from '../utils/apresentar-dados';
import { estilos } from '../theme/tema';

export default function ResumoEvolucao({ alunoId = '' }) {
    const [inicio, definirInicio] = useState(inicioPeriodo(30));
    const [fim, definirFim] = useState(hojeAcademia());
    const [periodo, definirPeriodo] = useState('Últimos 30 dias');
    const [filtro, definirFiltro] = useState({
        inicio: inicio,
        fim: fim,
    });
    const [selecionado, definirSelecionado] = useState('');
    const [pagina, definirPagina] = useState(0);
    let caminho = '/treinos/evolucao';
    if (alunoId) { caminho = '/equipe/alunos/' + alunoId + '/evolucao'; }
    const consulta = useConsulta(caminho + '?inicio=' + encodeURIComponent(filtro.inicio) + '&fim=' + encodeURIComponent(filtro.fim));
    let exercicios = [];
    if (consulta.dados) { exercicios = consulta.dados.exercicios; }
    function titulo(item, indice) {
        return (indice + 1) + '. ' + item.nome + ' · ' + item.equipamento + ' · ' + item.referenciaCarga;
    }
    const indice = exercicios.findIndex(function escolhido(item, numero) { return titulo(item, numero) === selecionado; });
    let exercicio = null;
    if (indice >= 0) { exercicio = exercicios[indice]; }
    function filtrar() {
        definirSelecionado('');
        definirPagina(0);
        definirFiltro({
            inicio: inicio,
            fim: fim,
        });
    }
    return (
        <View style={estilos.grupo}>
            <Text style={estilos.subtitulo}>Evolução oficial</Text>
            <CampoSelecao
                rotulo="Período"
                valor={periodo}
                opcoes={['Últimos 30 dias', 'Últimos 90 dias', 'Últimos 180 dias', 'Personalizar']}
                aoAlterar={function escolher(valor) {
                    definirPeriodo(valor);
                    if (valor !== 'Personalizar') {
                        const dias = Number(valor.split(' ')[1]);
                        const novoInicio = inicioPeriodo(dias);
                        const novoFim = hojeAcademia();
                        definirInicio(novoInicio); definirFim(novoFim);
                        definirFiltro({
                            inicio: novoInicio,
                            fim: novoFim,
                        });
                        definirSelecionado(''); definirPagina(0);
                    }
                }}
            />
            {periodo === 'Personalizar' && (
                <View style={estilos.grupo}>
                    <Campo
                        rotulo="Início (AAAA-MM-DD)"
                        value={inicio}
                        onChangeText={definirInicio}
                        maxLength={10}
                    />
                    <Campo
                        rotulo="Fim (AAAA-MM-DD)"
                        value={fim}
                        onChangeText={definirFim}
                        maxLength={10}
                    />
                    <Botao
                        titulo="Consultar período"
                        desabilitado={consulta.carregando}
                        aoPressionar={filtrar}
                    />
                </View>
            )}
            <EstadoConsulta consulta={consulta} />
            {consulta.dados && (
                <Text style={estilos.texto}>{consulta.dados.completos + ' completos · ' + consulta.dados.parciais + ' parciais'}</Text>
            )}
            {consulta.dados && exercicios.length === 0 && (
                <Text style={estilos.descricao}>Nenhuma série oficial registrada neste período.</Text>
            )}
            {exercicios.length > 0 && (
                <CampoSelecao
                    rotulo="Exercício e equipamento"
                    valor={selecionado}
                    opcoes={exercicios.map(titulo)}
                    aoAlterar={function escolher(valor) { definirSelecionado(valor); definirPagina(0); }}
                />
            )}
            {exercicio && (
                <View style={estilos.cartao}>
                    <Text style={estilos.descricao}>{exercicio.referenciaCarga + ' · ' + exercicio.tipo + '. Cada linha corresponde a uma série realizada.'}</Text>
                    {exercicio.registros.slice(pagina * 30, (pagina + 1) * 30).map(function mostrar(registro, numero) {
                        return (
                            <Text
                                key={numero}
                                style={estilos.texto}
                            >{dataDia(registro.dia) + ' · série ' + registro.numero + ': ' + registro.carga + ' kg × ' + registro.realizado}</Text>
                        );
                    })}
                    <Paginacao
                        pagina={pagina}
                        quantidade={exercicio.registros.slice(pagina * 30, (pagina + 1) * 30).length}
                        ocupado={consulta.carregando}
                        aoAlterar={definirPagina}
                    />
                </View>
            )}
        </View>
    );
}
