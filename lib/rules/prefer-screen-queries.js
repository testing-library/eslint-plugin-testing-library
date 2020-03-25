'use strict';

const { getDocsUrl, ALL_QUERIES_COMBINATIONS } = require('../utils');

const ALL_QUERIES_COMBINATIONS_REGEXP = ALL_QUERIES_COMBINATIONS.join('|');

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest using screen while using queries',
      category: 'Best Practices',
      recommended: false,
      url: getDocsUrl('prefer-screen-queries'),
    },
    messages: {
      preferScreenQueries:
        'Use screen to query DOM elements, `screen.{{ name }}`',
    },
    fixable: null,
    schema: [],
  },

  create: function(context) {
    function reportInvalidUsage(node) {
      context.report({
        node,
        messageId: 'preferScreenQueries',
        data: {
          name: node.name,
        },
      });
    }

    return {
      [`CallExpression > Identifier[name=/^${ALL_QUERIES_COMBINATIONS_REGEXP}$/]`]: reportInvalidUsage,
      [`MemberExpression[object.name!="screen"] > Identifier[name=/^${ALL_QUERIES_COMBINATIONS_REGEXP}$/]`]: reportInvalidUsage,
    };
  },
};
