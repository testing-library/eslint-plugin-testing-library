import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'no-await-sync-query';
export type MessageIds = 'noAwaitSyncQuery';
type Options = [];

const SYNC_QUERIES_REGEXP = /^(get|query)(All)?By(LabelText|PlaceholderText|Text|AltText|Title|DisplayValue|Role|TestId)$/;

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
      noAwaitSyncQuery: '`{{ name }}` does not need `await` operator',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const reportError = (node: TSESTree.Identifier) =>
      context.report({
        node,
        messageId: 'noAwaitSyncQuery',
        data: {
          name: node.name,
        },
      });
    return {
      [`AwaitExpression > CallExpression > Identifier[name=${SYNC_QUERIES_REGEXP}]`]: reportError,
      [`AwaitExpression > CallExpression > MemberExpression > Identifier[name=${SYNC_QUERIES_REGEXP}]`]: reportError,
    };
  },
});
