'use strict';

const { getDocsUrl, ALL_QUERIES_METHODS } = require('../utils');

const QUERIES_REGEXP = new RegExp(
  `^(get|query)(All)?(${ALL_QUERIES_METHODS.join('|')})$`
);
const PRESENCE_MATCHERS = ['toBeInTheDocument', 'toBeTruthy', 'toBeDefined'];
const ABSENCE_MATCHERS = ['toBeNull', 'toBeFalsy'];

module.exports = {
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Ensure appropriate get*/query* queries are used with their respective matchers',
      recommended: 'error',
      url: getDocsUrl('prefer-presence-queries'),
    },
    messages: {
      presenceQuery:
        'Use `getBy*` queries rather than `queryBy*` for checking element is present',
      absenceQuery:
        'Use `queryBy*` queries rather than `getBy*` for checking element is NOT present',
      expectQueryBy:
        'Use `getBy*` only when checking elements are present, otherwise use `queryBy*`',
    },
    schema: [],
    type: 'suggestion',
    fixable: null,
  },

  create: context => ({
    [`CallExpression Identifier[name=${QUERIES_REGEXP}]`](node) {
      const expectCallNode = findClosestCallNode(node, 'expect');

      if (expectCallNode) {
        const expectStatement = expectCallNode.parent;
        let matcher = expectStatement.property.name;
        let isNegatedMatcher = false;

        if (matcher === 'not') {
          isNegatedMatcher = true;
          matcher =
            expectStatement.parent &&
            expectStatement.parent.property &&
            expectStatement.parent.property.name;
        }

        if (!matcher) {
          return;
        }

        const validMatchers = isThrowingQuery(node)
          ? PRESENCE_MATCHERS
          : ABSENCE_MATCHERS;

        const invalidMatchers = isThrowingQuery(node)
          ? ABSENCE_MATCHERS
          : PRESENCE_MATCHERS;

        const messageId = isThrowingQuery(node)
          ? 'absenceQuery'
          : 'presenceQuery';

        if (
          (!isNegatedMatcher && invalidMatchers.includes(matcher)) ||
          (isNegatedMatcher && validMatchers.includes(matcher))
        ) {
          return context.report({
            node,
            messageId,
          });
        }
      }
    },
  }),
};

function isThrowingQuery(node) {
  return node.name.startsWith('get');
}

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
