module.exports = {
  testMatch: ['**/tests/**/*.js'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 96.55,
      functions: 100,
      lines: 98.97,
      statements: 0,
    },
  },
  testPathIgnorePatterns: ['<rootDir>/tests/fixtures/'],
  collectCoverageFrom: ['lib/**/*.js', '!**/node_modules/**'],
};
