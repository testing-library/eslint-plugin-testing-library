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
    let hasDestructuredDebugStatement = false;
    return {
      VariableDeclarator(node) {
        if (
          node.init.callee.name === 'render' &&
          node.id.type === 'ObjectPattern' &&
          node.id.properties.some(property => property.key.name === 'debug')
        ) {
          hasDestructuredDebugStatement = true;
        }
      },
      'Program:exit'() {},
      [`CallExpression > Identifier[name = "debug"]`](node) {
        if (hasDestructuredDebugStatement) {
          context.report({
            node,
            messageId: 'noDebug',
          });
        }
      },
    };
  },
};
