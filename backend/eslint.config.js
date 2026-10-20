export default [

    {

        ignores: ['node_modules/**'],
    },

    {

        files: ['**/*.js'],

        languageOptions: {

            ecmaVersion: 'latest',

            sourceType: 'module',

            globals: {

                console: 'readonly',
                fetch: 'readonly',
                AbortSignal: 'readonly',

                process: 'readonly',

                URL: 'readonly',
            },
        },

        rules: {

            'no-undef': 'error',

            'no-unused-vars': ['error', {

                argsIgnorePattern: '^_',
            }],

            'no-var': 'error',

            'prefer-const': 'error',

            'eqeqeq': 'error',

            'curly': 'error',

            'no-trailing-spaces': 'error',

            'comma-dangle': ['error', 'always-multiline'],

            'indent': ['error', 4],

            'object-curly-newline': ['error', {

                ObjectExpression: {

                    minProperties: 1,
                },

                ImportDeclaration: 'never',
            }],

            'object-property-newline': 'error',

            'no-ternary': 'error',

            'no-restricted-syntax': [

                'error',

                'ForStatement',

                'ForInStatement',

                'ForOfStatement',

                'ChainExpression',
                'SpreadElement',
                'RestElement',

                'LogicalExpression[operator="??"]',

                'CallExpression[callee.property.name="forEach"]',
            ],
        },
    },
];
