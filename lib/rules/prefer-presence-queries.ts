import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl, ALL_QUERIES_METHODS } from '../utils';
import {
  findClosestCallNode,
  isMemberExpression,
  isIdentifier,
} from '../node-utils';

const QUERIES_REGEXP = new RegExp(
  `^(get|query)(All)?(${ALL_QUERIES_METHODS.join('|')})$`
);
const PRESENCE_MATCHERS = ['toBeInTheDocument', 'toBeTruthy', 'toBeDefined'];
const ABSENCE_MATCHERS = ['toBeNull', 'toBeFalsy'];

export const RULE_NAME = 'prefer-presence-queries';
export type MessageIds = 'presenceQuery' | 'absenceQuery' | 'expectQueryBy';
type Options = [];

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Ensure appropriate get*/query* queries are used with their respective matchers',
      recommended: 'error',
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
  defaultOptions: [],

  create(context) {
    return {
      [`CallExpression Identifier[name=${QUERIES_REGEXP}]`](
        node: TSESTree.Identifier
      ) {
        const expectCallNode = findClosestCallNode(node, 'expect');

        if (expectCallNode && isMemberExpression(expectCallNode.parent)) {
          const expectStatement = expectCallNode.parent;
          if (!isIdentifier(expectStatement.property)) return;
          const property = expectStatement.property;
          let matcher = property.name;
          let isNegatedMatcher = false;

          if (
            matcher === 'not' &&
            isMemberExpression(expectStatement.parent) &&
            isIdentifier(expectStatement.parent.property)
          ) {
            isNegatedMatcher = true;
            matcher = expectStatement.parent.property.name;
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
    };
  },
});

function isThrowingQuery(node: TSESTree.Identifier) {
  return node.name.startsWith('get');
}
