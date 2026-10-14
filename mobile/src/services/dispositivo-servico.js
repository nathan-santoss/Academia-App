// Consulto o sistema, a marca, o modelo e o tipo do aparelho para a tela de preferências.
// Recebo pedidos das telas ou dos contextos e concentro esta tarefa para eles não repetirem a mesma preparação. Sou
// usado por Preferencias.jsx.

import * as Device from 'expo-device';

// Leio informações fornecidas pelo sistema e traduzo o tipo de aparelho para a tela Sobre.
export async function consultarDispositivo() {
    // Traduzo o tipo do aparelho sem presumir que todo dispositivo é um celular.
    const tipo = await Device.getDeviceTypeAsync();
    // Inicio descricaoTipo com o texto "Não informado"; vou ajustar esse valor conforme as condições abaixo.
    let descricaoTipo = 'Não informado';

    // Confiro se tipo é igual a Device.DeviceType.PHONE antes de executar o bloco abaixo.
    if (tipo === Device.DeviceType.PHONE) {
        // Atualizo descricaoTipo com o texto "Celular".
        descricaoTipo = 'Celular';
    // Confiro se tipo é igual a Device.DeviceType.TABLET antes de executar o bloco abaixo.
    } else if (tipo === Device.DeviceType.TABLET) {
        // Atualizo descricaoTipo com o texto "Tablet".
        descricaoTipo = 'Tablet';
    // Confiro se tipo é igual a Device.DeviceType.DESKTOP antes de executar o bloco abaixo.
    } else if (tipo === Device.DeviceType.DESKTOP) {
        // Atualizo descricaoTipo com o texto "Computador".
        descricaoTipo = 'Computador';
    // Confiro se tipo é igual a Device.DeviceType.TV antes de executar o bloco abaixo.
    } else if (tipo === Device.DeviceType.TV) {
        // Atualizo descricaoTipo com o texto "Televisão".
        descricaoTipo = 'Televisão';
    } // Encerro a conferência de tipo.

    // Consulto informações básicas; não coleto identificadores únicos do aparelho.
    return {
        // Preencho sistema com Device.osName no objeto que estou preparando.
        sistema: Device.osName,
        // Leio a versão do sistema operacional para apresentá-la na aba Sobre.
        versao: Device.osVersion,
        // Preencho marca com Device.brand no objeto que estou preparando.
        marca: Device.brand,
        // Preencho modelo com Device.modelName no objeto que estou preparando.
        modelo: Device.modelName,
        // Entrego a descrição do aparelho que escolhi nas condições acima.
        tipo: descricaoTipo,
    }; // Concluo este objeto com os campos que a etapa atual precisa.
} // Termino consultarDispositivo e devolvo o controle a quem chamou.
