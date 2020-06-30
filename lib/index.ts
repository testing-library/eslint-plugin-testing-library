import awaitAsyncQuery from './rules/await-async-query';
import awaitAsyncUtils from './rules/await-async-utils';
import awaitFireEvent from './rules/await-fire-event';
import consistentDataTestid from './rules/consistent-data-testid';
import noAwaitSyncQuery from './rules/no-await-sync-query';
import noContainer from './rules/no-container';
import noDebug from './rules/no-debug';
import noDomImport from './rules/no-dom-import';
import noManualCleanup from './rules/no-manual-cleanup';
import noNodeAccess from './rules/no-node-access';
import noWaitForEmptyCallback from './rules/no-wait-for-empty-callback';
import noPromiseInFireEvent from './rules/no-promise-in-fire-event';
import preferExplicitAssert from './rules/prefer-explicit-assert';
import preferPresenceQueries from './rules/prefer-presence-queries';
import preferScreenQueries from './rules/prefer-screen-queries';
import preferUserEvent from './rules/prefer-user-event';
import preferWaitFor from './rules/prefer-wait-for';
import noMultipleAssertionsWaitFor from './rules/no-multiple-assertions-wait-for'
import preferFindBy from './rules/prefer-find-by';
import renderResultNamingConvention from './rules/render-result-naming-convention';

const rules = {
  'await-async-query': awaitAsyncQuery,
  'await-async-utils': awaitAsyncUtils,
  'await-fire-event': awaitFireEvent,
  'consistent-data-testid': consistentDataTestid,
  'no-await-sync-query': noAwaitSyncQuery,
  'no-container': noContainer,
  'no-debug': noDebug,
  'no-dom-import': noDomImport,
  'no-manual-cleanup': noManualCleanup,
  'no-multiple-assertions-wait-for': noMultipleAssertionsWaitFor,
  'no-node-access': noNodeAccess,
  'no-promise-in-fire-event': noPromiseInFireEvent,
  'no-wait-for-empty-callback': noWaitForEmptyCallback,
  'prefer-explicit-assert': preferExplicitAssert,
  'prefer-find-by': preferFindBy,
  'prefer-presence-queries': preferPresenceQueries,
  'prefer-screen-queries': preferScreenQueries,
  'prefer-user-event': preferUserEvent,
  'prefer-wait-for': preferWaitFor,
  'render-result-naming-convention': renderResultNamingConvention,
};

const domRules = {
  'testing-library/await-async-query': 'error',
  'testing-library/await-async-utils': 'error',
  'testing-library/no-await-sync-query': 'error',
  'testing-library/no-promise-in-fire-event': 'error',
  'testing-library/no-wait-for-empty-callback': 'error',
  'testing-library/prefer-find-by': 'error',
  'testing-library/prefer-screen-queries': 'error',
  'testing-library/prefer-user-event': 'warn',
};

const angularRules = {
  ...domRules,
  'testing-library/no-container': 'error',
  'testing-library/no-debug': 'warn',
  'testing-library/no-dom-import': ['error', 'angular'],
  'testing-library/no-node-access': 'error',
  'testing-library/render-result-naming-convention': 'error',
};

const reactRules = {
  ...domRules,
  'testing-library/no-container': 'error',
  'testing-library/no-debug': 'warn',
  'testing-library/no-dom-import': ['error', 'react'],
  'testing-library/no-node-access': 'error',
  'testing-library/render-result-naming-convention': 'error',
};

const vueRules = {
  ...domRules,
  'testing-library/await-fire-event': 'error',
  'testing-library/no-container': 'error',
  'testing-library/no-debug': 'warn',
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
