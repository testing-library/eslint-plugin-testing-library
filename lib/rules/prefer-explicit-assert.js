'use strict';

const { getDocsUrl, ALL_QUERIES_METHODS } = require('../utils');

const ALL_GET_BY_QUERIES = ALL_QUERIES_METHODS.map(
  queryMethod => `get${queryMethod}`
);

const isValidQuery = (node, customQueries = []) =>
  ALL_GET_BY_QUERIES.includes(node.name) || customQueries.includes(node.name);

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
      description:
        'Suggest using explicit assertions rather than just `getBy*` queries',
      category: 'Best Practices',
      recommended: false,
      url: getDocsUrl('prefer-explicit-assert'),
    },
    messages: {
      noGetByAssert:
        'Wrap stand-alone `getBy*` query with `expect` function for better explicit assertion',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          customQueries: {
            type: 'array',
          },
        },
      },
    ],
  },

  create: function(context) {
    return {
      'CallExpression > Identifier'(node) {
        let customQueries;
        if (context.options && context.options.length > 0) {
          [{ customQueries }] = context.options;
        }

        if (
          isValidQuery(node, customQueries) &&
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
