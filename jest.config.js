export default {
  // Use ts-jest to transform TypeScript tests
  preset: 'ts-jest',
  testEnvironment: 'node',

  coverageDirectory: './test/coverage',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test/reports',
      },
    ],
  ],

  // Ignore the top-level `test` folder used for test fixtures, node_modules,
  // and compiled `dist` directory so we only run source tests.
  testPathIgnorePatterns: ['/node_modules/', '/test/', '/dist/'],

  // Transform TypeScript files with ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
