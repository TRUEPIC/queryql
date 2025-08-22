import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'cobertura'],
      all: true,
      include: ['src/**/*.{ts,js}'],
      exclude: ['dist/**', 'node_modules/**'],
    },
    reporters: ['default', ['junit', { outputFile: 'test/reports/junit.xml' }]],
    exclude: ['dist/**', 'node_modules/**'],
  },
})
