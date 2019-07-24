module.exports = {
  coverageDirectory: 'test/coverage',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test/reports',
      },
    ],
  ],
  testMatch: ['**/test/src/**/*.js'],
}
