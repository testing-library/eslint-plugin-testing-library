import { TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import { getDeepestIdentifierNode } from '../node-utils';

export const RULE_NAME = 'no-await-sync-query';
export type MessageIds = 'noAwaitSyncQuery';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary `await` for sync queries',
      recommendedConfig: {
        dom: 'error',
        angular: 'error',
        react: 'error',
        vue: 'error',
      },
    },
    messages: {
      noAwaitSyncQuery:
        '`{{ name }}` query is sync so it does not need to be awaited',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    return {
      'AwaitExpression > CallExpression'(node: TSESTree.CallExpression) {
        const deepestIdentifierNode = getDeepestIdentifierNode(node);

        if (!deepestIdentifierNode) {
          return;
        }

        if (helpers.isSyncQuery(deepestIdentifierNode)) {
          context.report({
            node: deepestIdentifierNode,
            messageId: 'noAwaitSyncQuery',
            data: {
              name: deepestIdentifierNode.name,
            },
          });
        }
      },
    };
  },
});
