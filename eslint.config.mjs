import globals from 'globals'
import eslintJs from '@eslint/js'
import tsEslint from 'typescript-eslint'

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

const config = {
    name: 'Global config',
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    rules: {
        '@typescript-eslint/no-unused-expressions': [
            'error',
            {
                allowShortCircuit: true,
                allowTernary: true,
                allowTaggedTemplates: true
            }
        ],
        '@typescript-eslint/no-unused-vars': 'off'
    }
}

export default [
    { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
    { languageOptions: { globals: globals.browser } },
    eslintJs.configs.recommended,
    eslintPluginPrettierRecommended,
    ...tsEslint.configs.recommended,
    config
]
