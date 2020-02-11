'use strict';

const { getDocsUrl } = require('../utils');

const FALSY_MATCHERS = ['toBeNull', 'toBeFalsy'];
const NOT_ALLOWED_NEGATED_MATCHERS = [
  'toBeInTheDocument',
  'toBeTruthy',
  'toBeDefined',
];

module.exports = {
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Disallow the use of `getBy*` queries when checking elements are not present',
      recommended: 'error',
      url: getDocsUrl('no-get-by-for-checking-element-not-present'),
    },
    messages: {
      expectQueryBy:
        'Use `getBy*` only when checking elements are present, otherwise use `queryBy*`',
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

          if (NOT_ALLOWED_NEGATED_MATCHERS.includes(negatedMatcher)) {
            return context.report({
              node,
              messageId: 'expectQueryBy',
            });
          }
        }

        if (FALSY_MATCHERS.includes(matcher)) {
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
