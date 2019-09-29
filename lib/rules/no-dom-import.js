'use strict';

const { getDocsUrl } = require('../utils');

const DOM_TESTING_LIBRARY_MODULES = [
  'dom-testing-library',
  '@testing-library/dom',
];

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow importing from DOM Testing Library',
      category: 'Best Practices',
      recommended: false,
      url: getDocsUrl('no-dom-import'),
    },
    messages: {
      noDomImport:
        'import from DOM Testing Library is restricted, import from corresponding Testing library framework instead',
    },
    fixable: null,
    schema: [],
  },

  create: function(context) {
    return {
      ImportDeclaration(node) {
        if (DOM_TESTING_LIBRARY_MODULES.includes(node.source.value)) {
          context.report({
            node,
            messageId: 'noDomImport',
          });
        }
      },

      [`CallExpression > Identifier[name="require"]`](node) {
        const { arguments: args } = node.parent;

        if (
          args.some(args => DOM_TESTING_LIBRARY_MODULES.includes(args.value))
        ) {
          context.report({
            node,
            messageId: 'noDomImport',
          });
        }
      },
    };
  },
};
