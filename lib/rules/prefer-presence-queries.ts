import { TSESTree } from '@typescript-eslint/experimental-utils';
import { findClosestCallNode, isMemberExpression } from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'prefer-presence-queries';
export type MessageIds = 'wrongPresenceQuery' | 'wrongAbsenceQuery';
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
      wrongPresenceQuery:
        'Use `getBy*` queries rather than `queryBy*` for checking element is present',
      wrongAbsenceQuery:
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

        // Sync queries (getBy and queryBy) are corresponding ones used
        // to check presence or absence. If none found, stop the rule.
        if (!helpers.isSyncQuery(node)) {
          return;
        }

        const isPresenceQuery = helpers.isGetQueryVariant(node);
        const expectStatement = expectCallNode.parent;
        const isPresenceAssert = helpers.isPresenceAssert(expectStatement);
        const isAbsenceAssert = helpers.isAbsenceAssert(expectStatement);

        if (!isPresenceAssert && !isAbsenceAssert) {
          return;
        }

        if (isPresenceAssert && !isPresenceQuery) {
          return context.report({ node, messageId: 'wrongPresenceQuery' });
        }

        if (isAbsenceAssert && isPresenceQuery) {
          return context.report({ node, messageId: 'wrongAbsenceQuery' });
        }
      },
    };
  },
});
