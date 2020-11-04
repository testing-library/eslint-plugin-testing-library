import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { ABSENCE_MATCHERS, PRESENCE_MATCHERS } from '../utils';
import { findClosestCallNode, isMemberExpression } from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'prefer-presence-queries';
export type MessageIds = 'presenceQuery' | 'absenceQuery';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
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
    },
    schema: [],
    type: 'suggestion',
    fixable: null,
  },
  defaultOptions: [],

  create(context, _, helpers) {
    return {
      'CallExpression Identifier'(node: TSESTree.Identifier) {
        const expectCallNode = findClosestCallNode(node, 'expect');

        if (!expectCallNode || !isMemberExpression(expectCallNode.parent)) {
          return;
        }

        if (!helpers.isSyncQuery(node)) {
          return;
        }

        const isPresenceQuery = helpers.isGetByQuery(node);
        const expectStatement = expectCallNode.parent;
        let matcher =
          ASTUtils.isIdentifier(expectStatement.property) &&
          expectStatement.property.name;
        let isNegatedMatcher = false;

        if (
          matcher === 'not' &&
          isMemberExpression(expectStatement.parent) &&
          ASTUtils.isIdentifier(expectStatement.parent.property)
        ) {
          isNegatedMatcher = true;
          matcher = expectStatement.parent.property.name;
        }

        const validMatchers = isPresenceQuery
          ? PRESENCE_MATCHERS
          : ABSENCE_MATCHERS;

        const invalidMatchers = isPresenceQuery
          ? ABSENCE_MATCHERS
          : PRESENCE_MATCHERS;

        const messageId = isPresenceQuery ? 'absenceQuery' : 'presenceQuery';

        if (
          (!isNegatedMatcher && invalidMatchers.includes(matcher)) ||
          (isNegatedMatcher && validMatchers.includes(matcher))
        ) {
          context.report({
            node,
            messageId,
          });
        }
      },
    };
  },
});
