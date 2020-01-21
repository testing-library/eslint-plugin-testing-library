'use strict';

const { getDocsUrl } = require('../utils');

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
      url: getDocsUrl('await-async-query'),
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
        if (
          !isAwaited(node.parent.parent) &&
          !isPromiseResolved(node) &&
          !hasClosestExpectResolvesRejects(node)
        ) {
          testingLibraryQueryUsage.push(node);
        }
      },
      'Program:exit'() {
        testingLibraryQueryUsage.forEach(node => {
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
              messageId: 'awaitAsyncQuery',
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
                  messageId: 'awaitAsyncQuery',
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

function hasClosestExpectResolvesRejects(node) {
  if (!node.parent) {
    return;
  }

  if (node.type === 'CallExpression' && node.callee.name === 'expect') {
    const expectMatcher = node.parent.property;
    return (
      expectMatcher &&
      (expectMatcher.name === 'resolves' || expectMatcher.name === 'rejects')
    );
  } else {
    return hasClosestExpectResolvesRejects(node.parent);
  }
}
