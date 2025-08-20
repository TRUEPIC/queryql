const js = require('@eslint/js')
const prettier = require('eslint-config-prettier')
const vitest = require('eslint-plugin-vitest')
const node = require('eslint-plugin-n')
const globals = require('globals')

module.exports = [
  {
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'commonjs',
    },
  },
  js.configs.recommended,
  node.configs['flat/recommended'],
  prettier,
  {
    files: ['src/**/*.test.ts'],
    ...vitest.configs['recommended'],
    languageOptions: {
      globals: { ...vitest.globals },
    },
  },
]
