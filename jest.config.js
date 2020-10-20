module.exports = {
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    // TODO drop this custom threshold in v4
    './lib/detect-testing-library-utils.ts': {
      branches: 50,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './lib/node-utils.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
