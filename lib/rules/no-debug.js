'use strict';

const { getDocsUrl } = require('../utils');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary debug usages in the tests',
      category: 'Best Practices',
      recommended: true,
      url: getDocsUrl('no-debug'),
    },
    messages: {
      noDebug: 'Unexpected debug statement',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          renderFunctions: {
            type: 'array',
          },
        },
      },
    ],
  },

  create: function(context) {
    let hasDestructuredDebugStatement = false;
    const renderVariableDeclarators = [];

    let renderFunctions = [];
    if (context.options && context.options.length > 0) {
      [{ renderFunctions }] = context.options;
    }

    return {
      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.callee &&
          ['render', ...renderFunctions].some(
            name => name === node.init.callee.name
          )
        ) {
          if (
            node.id.type === 'ObjectPattern' &&
            node.id.properties.some(property => property.key.name === 'debug')
          ) {
            hasDestructuredDebugStatement = true;
          }

          if (node.id.type === 'Identifier') {
            renderVariableDeclarators.push(node);
          }
        }
      },
      [`CallExpression > Identifier[name="debug"]`](node) {
        if (hasDestructuredDebugStatement) {
          context.report({
            node,
            messageId: 'noDebug',
          });
        }
      },
      'Program:exit'() {
        renderVariableDeclarators.forEach(renderVar => {
          const renderVarReferences = context
            .getDeclaredVariables(renderVar)[0]
            .references.slice(1);
          renderVarReferences.forEach(ref => {
            const parent = ref.identifier.parent;
            if (
              parent &&
              parent.type === 'MemberExpression' &&
              parent.property.name === 'debug' &&
              parent.parent.type === 'CallExpression'
            ) {
              context.report({
                node: parent.property,
                messageId: 'noDebug',
              });
            }
          });
        });
      },
    };
  },
};
