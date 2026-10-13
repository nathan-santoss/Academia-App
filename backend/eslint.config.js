// Defino as verificações de estilo e sintaxe para manter o backend nas convenções do projeto.
export default [
    {
        // Ignoro as bibliotecas instaladas para verificar apenas o código do projeto.
        // Deixo o código das bibliotecas fora da revisão; eu só quero conferir os arquivos que mantenho no projeto.
        ignores: ['node_modules/**'],
    },
    {
        // Aplico estas convenções aos arquivos JavaScript do backend.
        files: ['**/*.js'],
        // Reconheço os módulos com import e os recursos disponíveis no Node.
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            // Declaro os nomes fornecidos pelo ambiente, sem precisar importá-los.
            globals: {
                console: 'readonly',
                process: 'readonly',
                URL: 'readonly',
            },
        },
        // Aponto variáveis incorretas e mantenho as comparações e os blocos explícitos.
        rules: {
            'no-undef': 'error',
            'no-unused-vars': ['error', {
                // Permito parâmetros começando com _ quando preciso manter a assinatura da função, mas não uso aquele valor.
                argsIgnorePattern: '^_',
            }],
            'no-var': 'error',
            'prefer-const': 'error',
            'eqeqeq': 'error',
            'curly': 'error',
            'no-trailing-spaces': 'error',
            'comma-dangle': ['error', 'always-multiline'],
            // Padronizo quatro espaços e propriedades em linhas separadas.
            'indent': ['error', 4],
            'object-curly-newline': ['error', {
                ObjectExpression: {
                    minProperties: 1,
                },
                ImportDeclaration: 'never',
            }],
            'object-property-newline': 'error',
            // Bloqueio os operadores e laços que combinamos não usar neste projeto.
            'no-ternary': 'error',
            // Coloco aqui as construções que combinamos evitar, para eu receber um aviso antes de entregar o código.
            'no-restricted-syntax': [
                'error',
                'ForStatement',
                'ForInStatement',
                'ForOfStatement',
                'ChainExpression',
                'LogicalExpression[operator="??"]',
                'CallExpression[callee.property.name="forEach"]',
            ],
        },
    },
];
