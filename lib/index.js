'use strict';

const rules = {
  'await-async-query': require('./rules/await-async-query'),
  'await-async-utils': require('./rules/await-async-utils'),
  'await-fire-event': require('./rules/await-fire-event'),
  'consistent-data-testid': require('./rules/consistent-data-testid'),
  'no-await-sync-query': require('./rules/no-await-sync-query'),
  'no-debug': require('./rules/no-debug'),
  'no-dom-import': require('./rules/no-dom-import'),
  'no-get-by-for-checking-element-not-present': require('./rules/no-get-by-for-checking-element-not-present'),
  'no-manual-cleanup': require('./rules/no-manual-cleanup'),
  'no-wait-for-empty-callback': require('./rules/no-wait-for-empty-callback'),
  'prefer-explicit-assert': require('./rules/prefer-explicit-assert'),
  'prefer-screen-queries': require('./rules/prefer-screen-queries'),
  'prefer-wait-for': require('./rules/prefer-wait-for'),
};

const recommendedRules = {
  'testing-library/await-async-query': 'error',
  'testing-library/await-async-utils': 'error',
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
