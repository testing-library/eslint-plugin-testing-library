import { TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import { findClosestCallNode, isMemberExpression } from '../node-utils';

export const RULE_NAME = 'prefer-presence-queries';
export type MessageIds = 'wrongAbsenceQuery' | 'wrongPresenceQuery';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    docs: {
      description:
        'Ensure appropriate `get*`/`query*` queries are used with their respective matchers',
      recommendedConfig: {
        dom: 'error',
        angular: 'error',
        react: 'error',
        vue: 'error',
      },
    },
    messages: {
      wrongPresenceQuery:
        'Use `getBy*` queries rather than `queryBy*` for checking element is present',
      wrongAbsenceQuery:
        'Use `queryBy*` queries rather than `getBy*` for checking element is NOT present',
    },
    schema: [],
    type: 'suggestion',
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
          context.report({ node, messageId: 'wrongPresenceQuery' });
        } else if (isAbsenceAssert && isPresenceQuery) {
          context.report({ node, messageId: 'wrongAbsenceQuery' });
        }
      },
    };
  },
});
