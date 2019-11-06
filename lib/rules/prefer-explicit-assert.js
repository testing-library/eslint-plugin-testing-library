'use strict';

const { findParent, getDocsUrl, ALL_QUERIES_METHODS } = require('../utils');

const ALL_GET_BY_QUERIES = ALL_QUERIES_METHODS.map(
  queryMethod => `get${queryMethod}`
);

const findCallExpressionParent = node =>
  findParent(node, node => node.type === 'CallExpression');

const isValidQuery = (node, customQueryNames = []) =>
  ALL_GET_BY_QUERIES.includes(node.name) ||
  customQueryNames.includes(node.name);

const isDirectlyCalledByFunction = node =>
  node.parent.type === 'CallExpression';

const isReturnedByArrowFunctionExpression = node =>
  node.parent.type === 'ArrowFunctionExpression';

const isDeclared = node =>
  !!findParent(node, node => node.type === 'VariableDeclarator');

const isReturnedByReturnStatement = node =>
  node.parent.type === 'ReturnStatement';

const isInDestructuringStatement = node =>
  (node.parent.type === 'Property' &&
    node.parent.parent.type === 'ObjectPattern') ||
  node.parent.type === 'ArrayPattern';

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
      preferExplicitAssert:
        'Wrap stand-alone `getBy*` query with `expect` function for better explicit assertion',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          customQueryNames: {
            type: 'array',
          },
        },
      },
    ],
  },

  create: function(context) {
    return {
      'CallExpression Identifier'(node) {
        const callExpressionNode = findCallExpressionParent(node);

        let customQueryNames;
        if (context.options && context.options.length > 0) {
          [{ customQueryNames }] = context.options;
        }

        if (
          isValidQuery(node, customQueryNames) &&
          !isInDestructuringStatement(node) &&
          !isDirectlyCalledByFunction(callExpressionNode) &&
          !isReturnedByArrowFunctionExpression(callExpressionNode) &&
          !isDeclared(callExpressionNode) &&
          !isReturnedByReturnStatement(callExpressionNode)
        ) {
          context.report({
            node,
            messageId: 'preferExplicitAssert',
          });
        }
      },
    };
  },
};
