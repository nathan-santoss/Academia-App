import { Text, View } from 'react-native';
import Botao from './Botao';
import { estilos } from '../theme/tema';

export default function EstadoConsulta({ consulta }) {
    return (
        <View style={estilos.grupo}>
            {consulta.carregando && (
                <Text style={estilos.descricao}>Carregando…</Text>
            )}
            {Boolean(consulta.erro) && (
                <Text
                    accessibilityLiveRegion="polite"
                    style={estilos.erro}
                >{consulta.erro}</Text>
            )}
            <Botao
                titulo="Atualizar"
                secundario
                desabilitado={consulta.carregando}
                aoPressionar={consulta.atualizar}
            />
        </View>
    );
}
