const js = require('@eslint/js')
const prettier = require('eslint-config-prettier')
const jest = require('eslint-plugin-jest')
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
  node.configs['flat/recommended-script'],
  prettier,
  {
    files: ['src/**/*.test.js'],
    ...jest.configs['flat/recommended'],
    ...jest.configs['flat/style'],
    languageOptions: {
      globals: { ...jest.environments.globals.globals },
    },
  },
]
