// Aplico as convenções de JavaScript e as verificações de componentes e hooks no aplicativo.
// Configuro as verificações usadas no desenvolvimento para manter os arquivos nas convenções do projeto.

// Retiro defineConfig de o resultado de require para usar esses campos diretamente neste trecho.
const { defineConfig } = require('eslint/config');
// Preparo expo com esta chamada. Carrego o módulo no formato CommonJS usado por esta configuração.
const expo = require('eslint-config-expo/flat');

// Reaproveito as verificações do Expo para React, JSX e dependências dos hooks.
module.exports = defineConfig([
    // Continuo a configuração deste arquivo com expo.
    expo,
    // Coloco o resultado desta expressão JavaScript dentro do conteúdo visual.
    {
        // Deixo estas pastas fora da verificação porque não são fontes que mantenho manualmente.
        ignores: ['dist/**', '.expo/**'],
    }, // Concluo este objeto com os campos que a etapa atual precisa.
    // Coloco o resultado desta expressão JavaScript dentro do conteúdo visual.
    {
        // Mantenho as mesmas convenções de leitura combinadas para o backend.
        files: ['**/*.js', '**/*.jsx'],
        // Reúno as regras que conferem as convenções combinadas para o projeto.
        rules: {
            // Padronizo quatro espaços por nível para enxergar quais trechos pertencem ao mesmo bloco.
            'indent': ['error', 4],
            // Exijo chaves nos blocos para ficar claro onde cada condição começa e termina.
            'curly': 'error',
            // Exijo comparação com tipo e valor, evitando conversões escondidas entre texto e número.
            'eqeqeq': 'error',
            // Evito espaços soltos no fim das linhas para manter a formatação limpa.
            'no-trailing-spaces': 'error',
            // Mantenho a vírgula final em estruturas com várias linhas para facilitar futuras inclusões.
            'comma-dangle': ['error', 'always-multiline'],
            // Bloqueio o operador ternário porque combinamos usar condições explícitas neste projeto.
            'no-ternary': 'error',
            // Distribuo propriedades e atributos para facilitar a leitura dos componentes.
            'object-curly-newline': ['error', {
                // Configuro a quebra de linha dos objetos escritos no código.
                ObjectExpression: {
                    // Exijo a quebra a partir desta quantidade de propriedades.
                    minProperties: 1,
                }, // Concluo os campos de ObjectExpression e volto ao objeto que reúne essa configuração.
                // Preservo os imports compactos para não espalhar seus nomes em várias linhas.
                ImportDeclaration: 'never',
            }], // Concluo este objeto com os campos que a etapa atual precisa.
            // Deixo cada propriedade do objeto em sua própria linha para facilitar a leitura.
            'object-property-newline': 'error',
            // Limito os atributos por linha para facilitar a leitura dos componentes.
            'react/jsx-max-props-per-line': ['error', {
                // Defino quantos atributos posso colocar juntos na mesma linha de JSX.
                maximum: 1,
            }], // Concluo este objeto com os campos que a etapa atual precisa.
            // Peço uma nova linha para o primeiro atributo quando o componente ocupa várias linhas.
            'react/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
            // Alinho o fechamento da tag com sua abertura para deixar o JSX organizado.
            'react/jsx-closing-bracket-location': ['error', 'tag-aligned'],
            // Listo as construções que combinamos evitar para que o verificador avise quando aparecerem.
            'no-restricted-syntax': [
                // Transformo a violação desta regra em erro para a verificação não passar.
                'error',
                // Bloqueio o laço for conforme a forma de escrita combinada para o projeto.
                'ForStatement',
                // Bloqueio for...in para manter as repetições dentro das opções combinadas.
                'ForInStatement',
                // Bloqueio for...of para manter as repetições dentro das opções combinadas.
                'ForOfStatement',
                // Bloqueio o acesso opcional com ?. para deixar as verificações explícitas.
                'ChainExpression',
                // Bloqueio a expansão com três pontos para deixar as cópias de dados explícitas.
                'SpreadElement',
                // Bloqueio os parâmetros com três pontos para manter os argumentos visíveis.
                'RestElement',
                // Bloqueio os três pontos nos atributos JSX para mostrar cada propriedade enviada.
                'JSXSpreadAttribute',
                // Incluo esta construção na lista de restrições para o verificador apontar seu uso.
                'LogicalExpression[operator="??"]',
                // Incluo esta construção na lista de restrições para o verificador apontar seu uso.
                'CallExpression[callee.property.name="forEach"]',
            ], // Concluo esta lista na ordem que a chamada espera.
        }, // Concluo os campos de rules e volto ao objeto que reúne essa configuração.
    }, // Concluo este objeto com os campos que a etapa atual precisa.
]); // Concluo esta lista na ordem que a chamada espera.
