import js from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import ts from 'typescript-eslint'

export default ts.config(
  // JS recommended rules (keeps JS files covered)
  js.configs.recommended,
  ts.configs.recommended,

  // Vitest for test files
  {
    files: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/__tests__/**/*.ts',
    ],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },

  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
)
