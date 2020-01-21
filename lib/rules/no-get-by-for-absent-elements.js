'use strict';

const { getDocsUrl } = require('../utils');

const falsyMatchers = ['toBeNull', 'toBeFalsy', 'toBeUndefined'];

module.exports = {
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Disallow using getBy* queries in expect calls when elements may not be present',
      recommended: 'error',
      url: getDocsUrl('no-get-by-for-absent-elements'),
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
    [`CallExpression > Identifier[name=/getBy|getAllBy/]`](node) {
      const expectCallNode = findClosestExpectStatement(node);

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
    },
  }),
};

function findClosestExpectStatement(node) {
  if (!node.parent) {
    return false;
  }

  if (node.type === 'CallExpression' && node.callee.name === 'expect') {
    return node;
  } else {
    return findClosestExpectStatement(node.parent);
  }
}
