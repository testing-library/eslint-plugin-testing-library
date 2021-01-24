import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  findClosestCallExpressionNode,
  isCallExpressionCallee,
} from '../node-utils';

export const RULE_NAME = 'no-await-sync-query';
export type MessageIds = 'noAwaitSyncQuery';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary `await` for sync queries',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      noAwaitSyncQuery:
        '`{{ name }}` query is sync so it does not need to be awaited',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    return {
      'AwaitExpression > CallExpression Identifier'(node: TSESTree.Identifier) {
        const closestCallExpression = findClosestCallExpressionNode(node, true);
        if (!closestCallExpression) {
          return;
        }

        if (!isCallExpressionCallee(closestCallExpression, node)) {
          return;
        }

        if (helpers.isSyncQuery(node)) {
          context.report({
            node,
            messageId: 'noAwaitSyncQuery',
            data: {
              name: node.name,
            },
          });
        }
      },
    };
  },
});
