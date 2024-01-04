module.exports = {
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
  testPathIgnorePatterns: ['/node_modules/', '/test/'],
}
