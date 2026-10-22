import BeneficiosAluno from '../components/BeneficiosAluno';
import { useAcesso } from '../contexts/AcessoContext';
import { Text } from 'react-native';
import TelaFormulario from '../components/TelaFormulario';
import PagamentosAluno from '../components/PagamentosAluno';
import { estilos } from '../theme/tema';

export default function Financeiro() {
    const { usuario } = useAcesso();
    return (
        <TelaFormulario>
            <Text style={estilos.titulo}>Meu plano</Text>
            <PagamentosAluno />
            <BeneficiosAluno
                alunoId={usuario.id}
                nome={usuario.nome}
            />
        </TelaFormulario>
    );
}
