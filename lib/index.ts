import rules from './rules';

const domRules = {
  'testing-library/await-async-query': 'error',
  'testing-library/await-async-utils': 'error',
  'testing-library/no-await-sync-query': 'error',
  'testing-library/no-promise-in-fire-event': 'error',
  'testing-library/no-wait-for-empty-callback': 'error',
  'testing-library/prefer-find-by': 'error',
  'testing-library/prefer-screen-queries': 'error',
};

const angularRules = {
  ...domRules,
  'testing-library/no-container': 'error',
  'testing-library/no-debug': 'error',
  'testing-library/no-dom-import': ['error', 'angular'],
  'testing-library/no-node-access': 'error',
  'testing-library/render-result-naming-convention': 'error',
};

const reactRules = {
  ...domRules,
  'testing-library/no-container': 'error',
  'testing-library/no-debug': 'error',
  'testing-library/no-dom-import': ['error', 'react'],
  'testing-library/no-node-access': 'error',
  'testing-library/render-result-naming-convention': 'error',
};

const vueRules = {
  ...domRules,
  'testing-library/await-fire-event': 'error',
  'testing-library/no-container': 'error',
  'testing-library/no-debug': 'error',
  'testing-library/no-dom-import': ['error', 'vue'],
  'testing-library/no-node-access': 'error',
  'testing-library/render-result-naming-convention': 'error',
};

export = {
  rules,
  configs: {
    dom: {
      plugins: ['testing-library'],
      rules: domRules,
    },
    angular: {
      plugins: ['testing-library'],
      rules: angularRules,
    },
    react: {
      plugins: ['testing-library'],
      rules: reactRules,
    },
    vue: {
      plugins: ['testing-library'],
      rules: vueRules,
    },
  },
};
