'use strict';

const { getDocsUrl } = require('../utils');

function isAwaited(node) {
  return VALID_PARENTS.includes(node.type);
}

function hasThenProperty(node) {
  return node.type === 'MemberExpression' && node.property.name === 'then';
}

function isPromiseResolved(node) {
  const parent = node.parent.parent;

  // fireEvent.click().then(...)
  return parent.type === 'CallExpression' && hasThenProperty(parent.parent);
}

const VALID_PARENTS = [
  'AwaitExpression',
  'ArrowFunctionExpression',
  'ReturnStatement',
];

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce async fire event methods to be awaited',
      category: 'Best Practices',
      recommended: false,
      url: getDocsUrl('await-fire-event'),
    },
    messages: {
      awaitFireEvent: 'async `fireEvent.{{ methodName }}` must be awaited',
    },
    fixable: null,
    schema: [],
  },

  create: function(context) {
    return {
      'CallExpression > MemberExpression > Identifier[name=fireEvent]'(node) {
        const fireEventMethodNode = node.parent.property;

        if (
          !isAwaited(node.parent.parent.parent) &&
          !isPromiseResolved(fireEventMethodNode)
        ) {
          context.report({
            node: fireEventMethodNode,
            messageId: 'awaitFireEvent',
            data: {
              methodName: fireEventMethodNode.name,
            },
          });
        }
      },
    };
  },
};
