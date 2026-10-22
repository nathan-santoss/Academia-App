import { exigirTexto, exigirNumero } from './validar-rotina.js';
import { erroOperacao } from './erro-operacao.js';

function validarMidia(valor, video) {
    if (valor === null || valor === undefined || valor === '') {
        return null;
    }
    let url;
    try {
        url = new URL(exigirTexto(valor, 'link de mídia', 2048));
    } catch {
        throw erroOperacao(422, 'Informe uma URL HTTPS válida.');
    }
    if (url.protocol !== 'https:' || url.username || url.password) {
        throw erroOperacao(422, 'Mídia deve usar HTTPS sem credenciais.');
    }
    if (video && !['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname)) {
        throw erroOperacao(422, 'Use um link revisado do YouTube.');
    }
    return url.href;
}

export function validarCadastroExercicio(entrada) {
    if (!entrada || !['local', 'oficial'].includes(entrada.origem) || !['repeticoes', 'duracao'].includes(entrada.tipo) || typeof entrada.ativo !== 'boolean') {
        throw erroOperacao(422, 'Informe origem, tipo e disponibilidade do exercício.');
    }
    const videoUrl = validarMidia(entrada.videoUrl, true);
    if (videoUrl && entrada.midiaRevisada !== true) {
        throw erroOperacao(422, 'Confirme a revisão manual do vídeo antes de publicar.');
    }
    let descricao = '';
    let termosBusca = '';
    if (entrada.descricao) {
        descricao = exigirTexto(entrada.descricao, 'descrição', 500);
    }
    if (entrada.termosBusca) {
        termosBusca = exigirTexto(entrada.termosBusca, 'termos de busca', 500);
    }
    return {
        nome: exigirTexto(entrada.nome, 'nome'),
        grupoMuscular: exigirTexto(entrada.grupoMuscular, 'grupo muscular', 60),
        equipamento: exigirTexto(entrada.equipamento, 'equipamento'),
        tipo: entrada.tipo,
        ativo: entrada.ativo,
        descricao: descricao,
        origem: entrada.origem,
        termosBusca: termosBusca,
        imagemUrl: validarMidia(entrada.imagemUrl, false),
        videoUrl: videoUrl,
        revisao: exigirNumero(entrada.revisao, 'revisão', 0, 2147483646),
    };
}
