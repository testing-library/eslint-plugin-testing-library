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
        'import from DOM Testing Library is restricted, import from corresponding Testing Library framework instead',
      noDomImportFramework:
        'import from DOM Testing Library is restricted, import from @testing-library/{{name}} instead',
    },
    fixable: null,
    schema: [
      {
        type: 'string',
      },
    ],
  },

  create: function(context) {
    const framework = context.options[0];

    return {
      ImportDeclaration(node) {
        if (DOM_TESTING_LIBRARY_MODULES.includes(node.source.value)) {
          report(context, node, framework);
        }
      },

      [`CallExpression > Identifier[name="require"]`](node) {
        const { arguments: args } = node.parent;

        if (
          args.some(args => DOM_TESTING_LIBRARY_MODULES.includes(args.value))
        ) {
          report(context, node, framework);
        }
      },
    };

    function report(context, node, framework) {
      if (framework) {
        context.report({
          node,
          messageId: 'noDomImportFramework',
          data: {
            name: framework,
          },
        });
      } else {
        context.report({
          node,
          messageId: 'noDomImport',
        });
      }
    }
  },
};
