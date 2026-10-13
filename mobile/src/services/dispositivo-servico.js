// Consulto o sistema, a marca, o modelo e o tipo do aparelho para a tela de preferências.
import * as Device from 'expo-device';

export async function consultarDispositivo() {
    // Traduzo o tipo do aparelho sem presumir que todo dispositivo é um celular.
    const tipo = await Device.getDeviceTypeAsync();
    let descricaoTipo = 'Não informado';

    if (tipo === Device.DeviceType.PHONE) {
        descricaoTipo = 'Celular';
    } else if (tipo === Device.DeviceType.TABLET) {
        descricaoTipo = 'Tablet';
    } else if (tipo === Device.DeviceType.DESKTOP) {
        descricaoTipo = 'Computador';
    } else if (tipo === Device.DeviceType.TV) {
        descricaoTipo = 'Televisão';
    }

    // Consulto informações básicas; não coleto identificadores únicos do aparelho.
    return {
        sistema: Device.osName,
        versao: Device.osVersion,
        marca: Device.brand,
        modelo: Device.modelName,
        tipo: descricaoTipo,
    };
}
