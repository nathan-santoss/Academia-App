import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Campo from './Campo';
import Botao from './Botao';
import { consultarExercicios } from '../services/exercicio-servico';
import { estilos } from '../theme/tema';

export default function SelecionarExercicio({ aoSelecionar, aoCancelar }) {
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
        <View style={estilos.cartao}>
            <Text style={estilos.subtitulo}>Escolher exercício</Text>
            <Text style={estilos.descricao}>Exemplos para demonstração. Escolha séries, carga e repetições por conta própria; esta lista não é uma prescrição.</Text>
            <Campo
                rotulo="Pesquisar nome"
                value={busca}
                onChangeText={definirBusca}
                maxLength={100}
                onSubmitEditing={pesquisar}
            />
            <Campo
                rotulo="Grupo muscular (opcional, por exemplo Peito)"
                value={grupo}
                onChangeText={definirGrupo}
                maxLength={60}
            />
            <Botao
                titulo="Pesquisar / atualizar catálogo"
                desabilitado={ocupado}
                aoPressionar={pesquisar}
            />
            {ocupado && <Text style={estilos.descricao}>Consultando exercícios…</Text>}
            {Boolean(erro) && <Text style={estilos.erro}>{erro}</Text>}
            {resultado && resultado.dados.length === 0 && <Text style={estilos.descricao}>Nenhum exercício encontrado. Confira os filtros ou a preparação do catálogo neste ambiente.</Text>}
            {resultado && resultado.dados.map(function mostrar(item) {
                return (
                    <View
                        key={item.id}
                        style={estilos.grupo}
                    >
                        <Text style={estilos.texto}>{item.nome + ' • ' + item.grupoMuscular + ' • ' + item.equipamento}</Text>
                        {item.demonstrativo && <Text style={estilos.etiqueta}>Exemplo demonstrativo</Text>}
                        <Botao
                            titulo={'Selecionar ' + item.nome}
                            secundario
                            desabilitado={ocupado}
                            aoPressionar={function selecionar() { aoSelecionar(item); }}
                        />
                    </View>
                );
            })}
            {resultado && (
                <View style={estilos.grupo}>
                    <Text style={estilos.descricao}>{'Página ' + (consulta.pagina + 1) + ' • ' + resultado.total + ' exercícios encontrados'}</Text>
                    <Botao
                        titulo="Página anterior"
                        secundario
                        desabilitado={ocupado || consulta.pagina === 0}
                        aoPressionar={function anterior() { mudarPagina(-1); }}
                    />
                    <Botao
                        titulo="Próxima página"
                        secundario
                        desabilitado={ocupado || (consulta.pagina + 1) * resultado.limite >= resultado.total}
                        aoPressionar={function proxima() { mudarPagina(1); }}
                    />
                </View>
            )}
            <Botao
                titulo="Fechar catálogo"
                secundario
                aoPressionar={aoCancelar}
            />
        </View>
    );
}
