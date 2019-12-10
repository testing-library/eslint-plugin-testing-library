'use strict';

const { getDocsUrl, ALL_QUERIES_METHODS } = require('../utils');

const ALL_GET_BY_QUERIES = ALL_QUERIES_METHODS.map(
  queryMethod => `get${queryMethod}`
);

const isValidQuery = (node, customQueryNames) =>
  ALL_GET_BY_QUERIES.includes(node.name) ||
  customQueryNames.includes(node.name);

const isAtTopLevel = node => node.parent.parent.type === 'ExpressionStatement';

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
    const getQueryCalls = [];
    const customQueryNames =
      (context.options && context.options.length > 0
        ? context.options[0].customQueryNames
        : []) || [];

    return {
      'CallExpression Identifier'(node) {
        if (isValidQuery(node, customQueryNames)) {
          getQueryCalls.push(node);
        }
      },
      'Program:exit'() {
        getQueryCalls.forEach(queryCall => {
          const node =
            queryCall.parent.type === 'MemberExpression'
              ? queryCall.parent
              : queryCall;

          if (isAtTopLevel(node)) {
            context.report({
              node: queryCall,
              messageId: 'preferExplicitAssert',
            });
          }
        });
      },
    };
  },
};
