'use strict';

const { getDocsUrl } = require('../utils');

const falsyMatchers = ['toBeNull', 'toBeFalsy', 'toBeUndefined'];

module.exports = {
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Disallow the use of getBy* queries in expect calls when elements may be absent',
      recommended: 'error',
      url: getDocsUrl('no-get-by-for-asserting-element-not-present'),
    },
    messages: {
      expectQueryBy:
        'Use `expect(getBy*)` only when elements are present, otherwise use `expect(queryBy*)`.',
    },
    schema: [],
    type: 'suggestion',
    fixable: null,
  },

  create: context => ({
    [`Identifier[name=/getBy|getAllBy/]`](node) {
      const expectCallNode = findClosestCallNode(node, 'expect');

      // expect(getByText("foo"))...
      if (expectCallNode) {
        const expectStatement = expectCallNode.parent;
        const matcher = expectStatement.property.name;

        if (matcher === 'not') {
          const negatedMatcher = expectStatement.parent.property.name;

          if (!falsyMatchers.includes(negatedMatcher)) {
            return context.report({
              node,
              messageId: 'expectQueryBy',
            });
          }
        }

        if (falsyMatchers.includes(matcher)) {
          return context.report({
            node,
            messageId: 'expectQueryBy',
          });
        }
      }

      const waitCallNode = findClosestCallNode(
        node,
        'waitForElementToBeRemoved'
      );

      if (waitCallNode) {
        return context.report({
          node,
          messageId: 'expectQueryBy',
        });
      }
    },
  }),
};

function findClosestCallNode(node, name) {
  if (!node.parent) {
    return false;
  }

  if (node.type === 'CallExpression' && node.callee.name === name) {
    return node;
  } else {
    return findClosestCallNode(node.parent, name);
  }
}
