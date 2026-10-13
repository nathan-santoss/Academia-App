// Aplico as convenções de JavaScript e as verificações de componentes e hooks no aplicativo.
const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');

// Reaproveito as verificações do Expo para React, JSX e dependências dos hooks.
module.exports = defineConfig([
    expo,
    {
        ignores: ['dist/**', '.expo/**'],
    },
    {
        // Mantenho as mesmas convenções de leitura combinadas para o backend.
        files: ['**/*.js', '**/*.jsx'],
        rules: {
            'indent': ['error', 4],
            'curly': 'error',
            'eqeqeq': 'error',
            'no-trailing-spaces': 'error',
            'comma-dangle': ['error', 'always-multiline'],
            'no-ternary': 'error',
            // Distribuo propriedades e atributos para facilitar a leitura dos componentes.
            'object-curly-newline': ['error', {
                ObjectExpression: {
                    minProperties: 1,
                },
                ImportDeclaration: 'never',
            }],
            'object-property-newline': 'error',
            'react/jsx-max-props-per-line': ['error', {
                maximum: 1,
            }],
            'react/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
            'react/jsx-closing-bracket-location': ['error', 'tag-aligned'],
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
]);
