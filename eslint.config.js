import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'playwright-report', 'test-results'] },
  {
    files: ['src/**/*.{ts,tsx}', 'e2e/**/*.ts', '*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/services/local/**'],
    rules: {
      'no-restricted-globals': [
        'warn', // pasa a 'error' al terminar la tarea 0.12
        { name: 'localStorage', message: 'Usa src/services/: las pantallas no acceden a almacenamiento (ADR 0001).' },
        { name: 'sessionStorage', message: 'Usa src/services/: las pantallas no acceden a almacenamiento (ADR 0001).' },
        { name: 'indexedDB', message: 'Usa src/services/: las pantallas no acceden a almacenamiento (ADR 0001).' },
      ],
    },
  },
  {
    files: ['server/**/*.mjs', 'scripts/**/*.{mjs,cjs}', '*.js'],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.node },
  },
)
