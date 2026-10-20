import { Text, View } from 'react-native';
import Botao from './Botao';
import { estilos } from '../theme/tema';

export default function Paginacao({ pagina, quantidade, limite = 30, ocupado, aoAlterar }) {
    return (
        <View style={estilos.grupo}>
            <Text style={estilos.descricao}>{'Página ' + (pagina + 1)}</Text>
            <Botao
                titulo="Página anterior"
                secundario
                desabilitado={ocupado || pagina === 0}
                aoPressionar={function anterior() { aoAlterar(pagina - 1); }}
            />
            <Botao
                titulo="Próxima página"
                secundario
                desabilitado={ocupado || quantidade < limite}
                aoPressionar={function proxima() { aoAlterar(pagina + 1); }}
            />
        </View>
    );
}
