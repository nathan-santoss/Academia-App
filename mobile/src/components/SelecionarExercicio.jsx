import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import CampoRotina from './rotinas/CampoRotina';
import CampoSelecao from './CampoSelecao';
import AcaoRotina from './rotinas/AcaoRotina';
import { consultarExercicios } from '../services/exercicio-servico';
import { visualRotina as visual } from '../theme/rotina';

export default function SelecionarExercicio({ aoSelecionar, aoManual = null, aoCancelar = null }) {
    const [busca, definirBusca] = useState('');
    const [grupo, definirGrupo] = useState('');
    const [consulta, definirConsulta] = useState({
        busca: '',
        grupo: '',
        pagina: 0,
    });
    const [resultado, definirResultado] = useState(null);
    const [erro, definirErro] = useState('');
    const [ocupado, definirOcupado] = useState(true);

    useEffect(function carregar() {
        let visivel = true;
        consultarExercicios(consulta.busca, consulta.grupo, consulta.pagina).then(function recebeu(dados) {
            if (visivel) { definirResultado(dados); }
        }).catch(function falhou(falha) {
            if (visivel) { definirErro(falha.message); }
        }).finally(function terminou() {
            if (visivel) { definirOcupado(false); }
        });
        return function sair() { visivel = false; };
    }, [consulta]);

    function iniciarConsulta(nova) {
        definirOcupado(true);
        definirResultado(null);
        definirErro('');
        definirConsulta(nova);
    }

    function pesquisar() {
        iniciarConsulta({
            busca: busca.trim(),
            grupo: grupo.trim(),
            pagina: 0,
        });
    }

    function mudarPagina(direcao) {
        iniciarConsulta(Object.assign({}, consulta, {
            pagina: consulta.pagina + direcao,
        }));
    }

    return (
        <View style={visual.grupo}>
            <CampoRotina
                rotulo="Buscar exercício pelo nome"
                valor={busca}
                aoAlterar={definirBusca}
                aoEnviar={pesquisar}
            />
            <CampoSelecao
                rotulo="Grupo muscular"
                valor={grupo || 'Todos'}
                opcoes={['Todos', 'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Abdômen', 'Cardio']}
                permitirOutro
                aoAlterar={function escolher(valor) {
                    if (valor === 'Todos') { definirGrupo(''); }
                    else { definirGrupo(valor); }
                }}
            />
            <View style={visual.linha}>
                <AcaoRotina
                    titulo="Pesquisar"
                    desabilitada={ocupado}
                    aoPressionar={pesquisar}
                />
                {aoManual && (
                    <AcaoRotina
                        titulo="+ Criar exercício"
                        secundaria
                        aoPressionar={aoManual}
                    />
                )}
            </View>
            {ocupado && <Text style={visual.detalhe}>Consultando exercícios…</Text>}
            {Boolean(erro) && (
                <View style={visual.grupo}>
                    <Text
                        style={visual.erro}
                        accessibilityLiveRegion="polite"
                    >{erro}</Text>
                    <AcaoRotina
                        titulo="Tentar novamente"
                        secundaria
                        aoPressionar={pesquisar}
                    />
                </View>
            )}
            {resultado && resultado.dados.length === 0 && (
                <Text style={visual.detalhe}>Nenhum exercício encontrado. Tente outro nome ou crie seu exercício.</Text>
            )}
            {resultado && resultado.dados.map(function mostrar(item) {
                let titulo = item.nome + '\n' + item.grupoMuscular + ' • ' + item.equipamento;
                if (item.demonstrativo) { titulo += '\nExemplo demonstrativo'; }
                return (
                    <View
                        key={item.id}
                        style={visual.grupo}
                    >
                        <AcaoRotina
                            titulo={titulo}
                            descricao="Selecionar exercício"
                            secundaria
                            aoPressionar={function selecionar() { aoSelecionar(item); }}
                        />
                        {Boolean(item.descricao) && (
                            <Text
                                style={visual.detalhe}
                                numberOfLines={2}
                            >{item.descricao}</Text>
                        )}
                    </View>
                );
            })}
            {resultado && (
                <View style={visual.grupo}>
                    <Text style={visual.detalhe}>{'Página ' + (consulta.pagina + 1) + ' • ' + resultado.total + ' exercícios'}</Text>
                    <View style={visual.linha}>
                        <AcaoRotina
                            titulo="Anterior"
                            secundaria
                            desabilitada={ocupado || consulta.pagina === 0}
                            aoPressionar={function anterior() { mudarPagina(-1); }}
                        />
                        <AcaoRotina
                            titulo="Próxima"
                            secundaria
                            desabilitada={ocupado || (consulta.pagina + 1) * resultado.limite >= resultado.total}
                            aoPressionar={function proxima() { mudarPagina(1); }}
                        />
                    </View>
                </View>
            )}
            {aoCancelar && (
                <AcaoRotina
                    titulo="Fechar catálogo"
                    secundaria
                    aoPressionar={aoCancelar}
                />
            )}
        </View>
    );
}
