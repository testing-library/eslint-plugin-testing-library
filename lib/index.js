'use strict';
const path = require('path');
const requireIndex = require('requireindex');

const rules = requireIndex(path.join(__dirname, '/rules'));

module.exports = {
  rules,
  configs: {
    all: {
      plugins: ['testing-library'],
      rules,
    },
    recommended: {
      plugins: ['testing-library'],
      rules: {
        'testing-library/await-async-query': 'error',
        'testing-library/no-await-sync-query': 'error',
      },
    },
  },
};
