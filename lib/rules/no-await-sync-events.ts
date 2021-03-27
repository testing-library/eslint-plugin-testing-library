import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { EVENTS_SIMULATORS } from '../utils';
import { isObjectExpression, isProperty } from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'no-await-sync-events';
export type MessageIds = 'noAwaitSyncEvents';
type Options = [];

const SYNC_EVENTS_REGEXP = new RegExp(`^(${EVENTS_SIMULATORS.join('|')})$`);

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary `await` for sync events',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      noAwaitSyncEvents:
        '`{{ name }}` is sync and does not need `await` operator',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    // userEvent.type() and userEvent.keyboard() are exceptions, which returns a
    // Promise. But it is only necessary to wait when delay option other than 0
    // is specified. So this rule has a special exception
    // for the case await:
    //  - userEvent.type(element, 'abc', {delay: 1234})
    //  - userEvent.keyboard('abc', {delay: 1234})
    return {
      [`AwaitExpression > CallExpression > MemberExpression > Identifier[name=${SYNC_EVENTS_REGEXP}]`](
        node: TSESTree.Identifier
      ) {
        const memberExpression = node.parent as TSESTree.MemberExpression;
        const methodNode = memberExpression.property as TSESTree.Identifier;
        const callExpression = memberExpression.parent as TSESTree.CallExpression;
        const lastArg =
          callExpression.arguments[callExpression.arguments.length - 1];
        const withDelay =
          isObjectExpression(lastArg) &&
          lastArg.properties.some(
            (property) =>
              isProperty(property) &&
              ASTUtils.isIdentifier(property.key) &&
              property.key.name === 'delay'
          );

        if (
          !(
            node.name === 'userEvent' &&
            ['type', 'keyboard'].includes(methodNode.name) &&
            withDelay
          )
        ) {
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
