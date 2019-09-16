'use strict';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary debug usages in the tests',
      category: 'Best Practices',
      recommended: true,
      url: 'TODO',
    },
    messages: {
      noDebug: 'Unexpected debug statement',
    },
    fixable: null,
    schema: [],
  },

  create: function(context) {
    return {
      Identifier(node) {
        if (node.name === 'debug') {
          context.report({
            node,
            messageId: 'noDebug',
          });
        }
      },
    };
  },
};
