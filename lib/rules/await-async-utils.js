'use strict';

const { getDocsUrl, ASYNC_UTILS } = require('../utils');

const VALID_PARENTS = [
  'AwaitExpression',
  'ArrowFunctionExpression',
  'ReturnStatement',
];

const ASYNC_UTILS_REGEXP = new RegExp(`^(${ASYNC_UTILS.join('|')})$`);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce async utils to be awaited properly',
      category: 'Best Practices',
      recommended: true,
      url: getDocsUrl('await-async-utils'),
    },
    messages: {
      awaitAsyncUtil: 'Promise returned from `{{ name }}` must be handled',
    },
    fixable: null,
    schema: [],
  },

  create: function(context) {
    const testingLibraryUtilUsage = [];
    return {
      [`CallExpression > Identifier[name=${ASYNC_UTILS_REGEXP}]`](node) {
        if (!isAwaited(node.parent.parent) && !isPromiseResolved(node)) {
          testingLibraryUtilUsage.push(node);
        }
      },
      'Program:exit'() {
        testingLibraryUtilUsage.forEach(node => {
          const variableDeclaratorParent = node.parent.parent;

          const references =
            (variableDeclaratorParent.type === 'VariableDeclarator' &&
              context
                .getDeclaredVariables(variableDeclaratorParent)[0]
                .references.slice(1)) ||
            [];

          if (
            references &&
            references.length === 0 &&
            !isAwaited(node.parent.parent) &&
            !isPromiseResolved(node)
          ) {
            context.report({
              node,
              messageId: 'awaitAsyncUtil',
              data: {
                name: node.name,
              },
            });
          } else {
            for (const reference of references) {
              const referenceNode = reference.identifier;
              if (
                !isAwaited(referenceNode.parent) &&
                !isPromiseResolved(referenceNode)
              ) {
                context.report({
                  node,
                  messageId: 'awaitAsyncUtil',
                  data: {
                    name: node.name,
                  },
                });

                break;
              }
            }
          }
        });
      },
    };
  },
};

function isAwaited(node) {
  return VALID_PARENTS.includes(node.type);
}

const hasAThenProperty = node =>
  node.type === 'MemberExpression' && node.property.name === 'then';

function isPromiseResolved(node) {
  const parent = node.parent;

  // wait(...).then(...)
  if (parent.type === 'CallExpression') {
    return hasAThenProperty(parent.parent);
  }

  // promise.then(...)
  return hasAThenProperty(parent);
}
