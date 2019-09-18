'use strict';

const VALID_PARENTS = [
  'AwaitExpression',
  'ArrowFunctionExpression',
  'ReturnStatement',
];

const ASYNC_QUERIES_REGEXP = /^find(All)?By(LabelText|PlaceholderText|Text|AltText|Title|DisplayValue|Role|TestId)$/;

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce async queries to have proper `await`',
      category: 'Best Practices',
      recommended: true,
      url: 'TODO',
    },
    messages: {
      awaitAsyncQuery: '`{{ name }}` must have `await` operator',
    },
    fixable: null,
    schema: [],
  },

  create: function(context) {
    const testingLibraryQueryUsage = [];
    return {
      [`CallExpression > Identifier[name=${ASYNC_QUERIES_REGEXP}]`](node) {
        testingLibraryQueryUsage.push(node);
      },
      'Program:exit'() {
        testingLibraryQueryUsage.forEach(node => {
          const variableDeclaratorParent = findParent(
            node,
            parent => parent.type === 'VariableDeclarator'
          );

          const references =
            (variableDeclaratorParent &&
              context
                .getDeclaredVariables(variableDeclaratorParent)[0]
                .references.slice(1)) ||
            [];

          if (
            references.length === 0 &&
            !isAwaited(node.parent.parent) &&
            !isPromiseResolved(node)
          ) {
            context.report({
              node,
              messageId: 'awaitAsyncQuery',
              data: {
                name: node.name,
              },
            });
          } else {
            references.forEach(reference => {
              const node = reference.identifier;
              if (!isAwaited(node.parent) && !isPromiseResolved(node)) {
                context.report({
                  node: reference.identifier,
                  messageId: 'awaitAsyncQuery',
                  data: {
                    name: node.name,
                  },
                });
              }
            });
          }
        });
      },
    };
  },
};

function isAwaited(node) {
  return VALID_PARENTS.includes(node.type);
}

function isPromiseResolved(node) {
  const parent = node.parent;

  const hasAThenProperty = node =>
    node.type === 'MemberExpression' && node.property.name === 'then';

  // findByText("foo").then(...)
  if (parent.type === 'CallExpression') {
    return hasAThenProperty(parent.parent);
  }

  // promise.then(...)
  return hasAThenProperty(parent);
}

function findParent(node, test) {
  if (test(node)) {
    return node;
  } else if (node.parent) {
    return findParent(node.parent, test);
  }
  return null;
}
