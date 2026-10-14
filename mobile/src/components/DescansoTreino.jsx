import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Botao from './Botao';
import { estilos } from '../theme/tema';

export default function DescansoTreino({ ate, aoAlterar, bloqueado }) {
    const [agora, definirAgora] = useState(function horarioInicial() { return Date.now(); });
    useEffect(function acompanharRelogio() {
        const intervalo = setInterval(function atualizar() { definirAgora(Date.now()); }, 1000);
        return function parar() { clearInterval(intervalo); };
    }, []);
    // Calculo pelo horário final para o descanso não reiniciar ao voltar do segundo plano.
    const segundos = Math.max(0, Math.ceil((ate - agora) / 1000));
    return (
        <View style={estilos.cartao}>
            <Text style={estilos.subtitulo}>{'Descanso: ' + segundos + ' s'}</Text>
            <Botao
                titulo="Acrescentar 30 segundos"
                secundario
                desabilitado={bloqueado}
                aoPressionar={function aumentar() {
                    aoAlterar(Math.max(Date.now(), ate) + 30000);
                }}
            />
            <Botao
                titulo="Encerrar descanso"
                secundario
                desabilitado={bloqueado}
                aoPressionar={function terminar() { aoAlterar(0); }}
            />
        </View>
    );
}
