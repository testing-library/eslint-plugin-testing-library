'use strict';

const { getDocsUrl } = require('../utils');

const isDirectlyCalledByFunction = node =>
  node.parent.parent.type === 'CallExpression';

const isReturnedByArrowFunctionExpression = node =>
  node.parent.parent.type === 'ArrowFunctionExpression';

const isDeclared = node => node.parent.parent.type === 'VariableDeclarator';

const isReturnedByReturnStatement = node =>
  node.parent.parent.type === 'ReturnStatement';

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow `getBy*` queries as assertion method itself',
      category: 'Best Practices',
      recommended: false,
      url: getDocsUrl('no-get-by-assert'),
    },
    messages: {
      noGetByAssert: 'Disallowed use of `getBy*` query as implicit assert',
    },
    fixable: null,
    schema: [],
  },

  create: function(context) {
    return {
      [`CallExpression > Identifier[name=${/^getBy(LabelText|PlaceholderText|Text|AltText|Title|DisplayValue|Role|TestId)$/}]`](
        node
      ) {
        if (
          !isDirectlyCalledByFunction(node) &&
          !isReturnedByArrowFunctionExpression(node) &&
          !isDeclared(node) &&
          !isReturnedByReturnStatement(node)
        ) {
          context.report({
            node,
            messageId: 'noGetByAssert',
          });
        }
      },
    };
  },
};
