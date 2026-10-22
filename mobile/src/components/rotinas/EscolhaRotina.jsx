import { useState } from 'react';
import { Text, View } from 'react-native';
import AcaoRotina from './AcaoRotina';
import CampoRotina from './CampoRotina';
import { visualRotina as visual } from '../../theme/rotina';

export default function EscolhaRotina({ rotulo, valor, opcoes, aoAlterar, numerico = false, limite = 100 }) {
    const [personalizar, definirPersonalizar] = useState(false);
    const texto = String(valor);
    const personalizado = Boolean(texto) && !opcoes.includes(texto);
    return (
        <View style={visual.grupo}>
            <Text style={visual.detalhe}>{rotulo}</Text>
            <View style={visual.linha}>
                {opcoes.map(function opcao(item) {
                    return (
                        <AcaoRotina
                            key={item}
                            titulo={item}
                            descricao={rotulo}
                            secundaria
                            selecionada={texto === item}
                            aoPressionar={function selecionar() {
                                definirPersonalizar(false);
                                aoAlterar(item);
                            }}
                        />
                    );
                })}
                <AcaoRotina
                    titulo="Outro"
                    secundaria
                    selecionada={personalizar || personalizado}
                    aoPressionar={function abrir() { definirPersonalizar(!personalizar); }}
                />
            </View>
            {(personalizar || personalizado) && (
                <CampoRotina
                    rotulo={rotulo + ' — valor personalizado'}
                    valor={valor}
                    aoAlterar={aoAlterar}
                    numerico={numerico}
                    limite={limite}
                />
            )}
        </View>
    );
}
