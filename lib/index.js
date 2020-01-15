'use strict';

const rules = {
  'await-async-query': require('./rules/await-async-query'),
  'await-fire-event': require('./rules/await-fire-event'),
  'consistent-data-testid': require('./rules/consistent-data-testid'),
  'no-await-sync-query': require('./rules/no-await-sync-query'),
  'no-debug': require('./rules/no-debug'),
  'no-dom-import': require('./rules/no-dom-import'),
  'prefer-expect-query-by': require('./rules/prefer-expect-query-by'),
  'prefer-explicit-assert': require('./rules/prefer-explicit-assert'),
};

const recommendedRules = {
  'testing-library/await-async-query': 'error',
  'testing-library/no-await-sync-query': 'error',
};

module.exports = {
  rules,
  configs: {
    recommended: {
      plugins: ['testing-library'],
      rules: recommendedRules,
    },
    angular: {
      plugins: ['testing-library'],
      rules: {
        ...recommendedRules,
        'testing-library/no-debug': 'warn',
        'testing-library/no-dom-import': ['error', 'angular'],
      },
    },
    react: {
      plugins: ['testing-library'],
      rules: {
        ...recommendedRules,
        'testing-library/no-debug': 'warn',
        'testing-library/no-dom-import': ['error', 'react'],
      },
    },
    vue: {
      plugins: ['testing-library'],
      rules: {
        ...recommendedRules,
        'testing-library/await-fire-event': 'error',
        'testing-library/no-debug': 'warn',
        'testing-library/no-dom-import': ['error', 'vue'],
      },
    },
  },
};
