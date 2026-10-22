import { useState } from 'react';
import { Text, View } from 'react-native';
import AcaoRotina from './rotinas/AcaoRotina';
import CampoRotina from './rotinas/CampoRotina';
import EscolhaRotina from './rotinas/EscolhaRotina';
import { visualRotina as visual } from '../theme/rotina';

export default function EditorExercicio({ exercicio, aoAlterar }) {
    const [detalhes, definirDetalhes] = useState(false);
    let rotuloMeta = 'Repetições por série';
    let metas = ['6', '8', '10', '12', '15'];
    if (exercicio.tipo === 'duracao') {
        rotuloMeta = 'Duração por série (segundos)';
        metas = ['20', '30', '45', '60', '90'];
    }

    function alterar(campo, valor) {
        aoAlterar(Object.assign({}, exercicio, {
            [campo]: valor,
        }));
    }

    function mudarTipo(tipo) {
        if (tipo !== exercicio.tipo) {
            // Limpo a meta para não transformar repetições em segundos sem confirmação.
            aoAlterar(Object.assign({}, exercicio, {
                tipo: tipo,
                meta: '',
            }));
        }
    }

    return (
        <View style={visual.grupo}>
            <CampoRotina
                rotulo="Nome do exercício"
                valor={exercicio.nome}
                aoAlterar={function nome(valor) { alterar('nome', valor); }}
            />
            <EscolhaRotina
                rotulo="Equipamento"
                valor={exercicio.equipamento}
                opcoes={['Peso corporal', 'Halteres', 'Barra', 'Máquina', 'Polia', 'Elástico', 'Kettlebell']}
                aoAlterar={function equipamento(valor) { alterar('equipamento', valor); }}
            />
            <View style={visual.linha}>
                <AcaoRotina
                    titulo="Repetições"
                    secundaria
                    selecionada={exercicio.tipo === 'repeticoes'}
                    aoPressionar={function repeticoes() { mudarTipo('repeticoes'); }}
                />
                <AcaoRotina
                    titulo="Duração"
                    secundaria
                    selecionada={exercicio.tipo === 'duracao'}
                    aoPressionar={function duracao() { mudarTipo('duracao'); }}
                />
            </View>
            <EscolhaRotina
                rotulo="Séries"
                valor={exercicio.series}
                opcoes={['1', '2', '3', '4', '5']}
                numerico
                limite={2}
                aoAlterar={function series(valor) { alterar('series', valor); }}
            />
            <EscolhaRotina
                rotulo={rotuloMeta}
                valor={exercicio.meta}
                opcoes={metas}
                numerico
                limite={5}
                aoAlterar={function meta(valor) { alterar('meta', valor); }}
            />
            <EscolhaRotina
                rotulo="Descanso entre séries (segundos)"
                valor={exercicio.descanso}
                opcoes={['0', '30', '60', '90', '120']}
                numerico
                limite={4}
                aoAlterar={function descanso(valor) { alterar('descanso', valor); }}
            />
            <CampoRotina
                rotulo="Carga em kg (opcional)"
                valor={exercicio.carga}
                exemplo="Sem carga informada"
                numerico
                limite={10}
                aoAlterar={function carga(valor) { alterar('carga', valor); }}
            />
            <Text style={visual.detalhe}>{'Referência da carga: ' + exercicio.referenciaCarga}</Text>
            <AcaoRotina
                titulo="Referência da carga e observações"
                secundaria
                selecionada={detalhes}
                aoPressionar={function abrir() { definirDetalhes(!detalhes); }}
            />
            {detalhes && (
                <View style={visual.cartao}>
                    <EscolhaRotina
                        rotulo="Como a carga é medida"
                        valor={exercicio.referenciaCarga}
                        opcoes={['total em kg', 'por halter em kg', 'por lado em kg', 'peso corporal']}
                        limite={60}
                        aoAlterar={function referencia(valor) { alterar('referenciaCarga', valor); }}
                    />
                    <CampoRotina
                        rotulo="Observações (opcional)"
                        valor={exercicio.observacoes}
                        limite={500}
                        multilinha
                        aoAlterar={function observacoes(valor) { alterar('observacoes', valor); }}
                    />
                </View>
            )}
            <Text style={visual.detalhe}>As opções facilitam o preenchimento. Escolha os valores conforme sua orientação de treino.</Text>
        </View>
    );
}
