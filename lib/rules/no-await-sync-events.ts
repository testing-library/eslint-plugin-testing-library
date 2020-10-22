import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl, ASYNC_EVENTS } from '../utils';

export const RULE_NAME = 'no-await-sync-events';
export type MessageIds = 'noAwaitSyncEvents';
type Options = [];

const ASYNC_EVENTS_REGEXP = new RegExp(`^(${ASYNC_EVENTS.join('|')})$`);
export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary `await` for sync events',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      noAwaitSyncEvents: '`{{ name }}` does not need `await` operator',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    // userEvent.type() is an exception, which returns a
    // Promise, even it resolves immediately.
    // for the sake of semantically correct, w/ or w/o await
    // are both OK
    return {
      [`AwaitExpression > CallExpression > MemberExpression > Identifier[name=${ASYNC_EVENTS_REGEXP}]`](
        node: TSESTree.Identifier
      ) {
        const memberExpression = node.parent as TSESTree.MemberExpression;
        const methodNode = memberExpression.property as TSESTree.Identifier;

        if (!(node.name === 'userEvent' && methodNode.name === 'type')) {
          context.report({
            node: methodNode,
            messageId: 'noAwaitSyncEvents',
            data: {
              name: `${node.name}.${methodNode.name}`,
            },
          });
        }
      },
    };
  },
});
