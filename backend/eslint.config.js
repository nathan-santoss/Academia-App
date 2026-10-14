// Defino as verificações de estilo e sintaxe para manter o backend nas convenções do projeto.
// Configuro as verificações usadas no desenvolvimento para manter os arquivos nas convenções do projeto.

// Continuo a configuração deste arquivo com os valores indicados nesta linha.
export default [
    // Coloco o resultado desta expressão JavaScript dentro do conteúdo visual.
    {
        // Deixo as bibliotecas instaladas fora da verificação; confiro somente o código que mantenho no projeto.
        ignores: ['node_modules/**'],
    }, // Concluo este objeto com os campos que a etapa atual precisa.
    // Coloco o resultado desta expressão JavaScript dentro do conteúdo visual.
    {
        // Aplico estas convenções aos arquivos JavaScript do backend.
        files: ['**/*.js'],
        // Reconheço os módulos com import e os recursos disponíveis no Node.
        languageOptions: {
            // Permito os recursos JavaScript reconhecidos pela versão instalada do verificador.
            ecmaVersion: 'latest',
            // Trato o arquivo como módulo para reconhecer import e export.
            sourceType: 'module',
            // Declaro os nomes fornecidos pelo ambiente, sem precisar importá-los.
            globals: {
                // Reconheço console como um recurso do ambiente para mensagens do servidor.
                console: 'readonly',
                // Reconheço process como um recurso do Node para ambiente e ciclo do servidor.
                process: 'readonly',
                // Reconheço URL como a ferramenta do ambiente para interpretar endereços.
                URL: 'readonly',
            }, // Concluo os campos de globals e volto ao objeto que reúne essa configuração.
        }, // Concluo os campos de languageOptions e volto ao objeto que reúne essa configuração.
        // Aponto variáveis incorretas e mantenho as comparações e os blocos explícitos.
        rules: {
            // Peço um erro quando uso um nome que não foi declarado, para encontrar enganos de digitação.
            'no-undef': 'error',
            // Aponto variáveis sem uso para evitar código que não participa do fluxo.
            'no-unused-vars': ['error', {
                // Permito parâmetros começando com _ quando preciso manter a assinatura da função, mas não uso aquele
                // valor.
                argsIgnorePattern: '^_',
            }], // Concluo este objeto com os campos que a etapa atual precisa.
            // Prefiro const e let porque seus limites seguem o bloco onde foram declarados.
            'no-var': 'error',
            // Peço const quando o valor não é reatribuído, deixando essa intenção clara.
            'prefer-const': 'error',
            // Exijo comparação com tipo e valor, evitando conversões escondidas entre texto e número.
            'eqeqeq': 'error',
            // Exijo chaves nos blocos para ficar claro onde cada condição começa e termina.
            'curly': 'error',
            // Evito espaços soltos no fim das linhas para manter a formatação limpa.
            'no-trailing-spaces': 'error',
            // Mantenho a vírgula final em estruturas com várias linhas para facilitar futuras inclusões.
            'comma-dangle': ['error', 'always-multiline'],
            // Padronizo quatro espaços e propriedades em linhas separadas.
            'indent': ['error', 4],
            // Separo os objetos em linhas, mas mantenho os imports compactos conforme a convenção.
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
            // Bloqueio os operadores e laços que combinamos não usar neste projeto.
            'no-ternary': 'error',
            // Coloco aqui as construções que combinamos evitar, para eu receber um aviso antes de entregar o código.
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
                // Incluo esta construção na lista de restrições para o verificador apontar seu uso.
                'LogicalExpression[operator="??"]',
                // Incluo esta construção na lista de restrições para o verificador apontar seu uso.
                'CallExpression[callee.property.name="forEach"]',
            ], // Concluo esta lista na ordem que a chamada espera.
        }, // Concluo os campos de rules e volto ao objeto que reúne essa configuração.
    }, // Concluo este objeto com os campos que a etapa atual precisa.
]; // Concluo esta lista na ordem que a chamada espera.
