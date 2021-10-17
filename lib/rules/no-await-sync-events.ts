import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  getDeepestIdentifierNode,
  getPropertyIdentifierNode,
  isLiteral,
  isObjectExpression,
  isProperty,
} from '../node-utils';

export const RULE_NAME = 'no-await-sync-events';
export type MessageIds = 'noAwaitSyncEvents';
type Options = [];

const USER_EVENT_ASYNC_EXCEPTIONS: string[] = ['type', 'keyboard'];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary `await` for sync events',
      recommendedConfig: {
        dom: false,
        angular: false,
        react: false,
        vue: false,
      },
    },
    messages: {
      noAwaitSyncEvents:
        '`{{ name }}` is sync and does not need `await` operator',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    // userEvent.type() and userEvent.keyboard() are exceptions, which returns a
    // Promise. But it is only necessary to wait when delay option other than 0
    // is specified. So this rule has a special exception for the case await:
    //  - userEvent.type(element, 'abc', {delay: 1234})
    //  - userEvent.keyboard('abc', {delay: 1234})
    return {
      'AwaitExpression > CallExpression'(node: TSESTree.CallExpression) {
        const simulateEventFunctionIdentifier = getDeepestIdentifierNode(node);

        if (!simulateEventFunctionIdentifier) {
          return;
        }

        const isSimulateEventMethod =
          helpers.isUserEventMethod(simulateEventFunctionIdentifier) ||
          helpers.isFireEventMethod(simulateEventFunctionIdentifier);

        if (!isSimulateEventMethod) {
          return;
        }

        const lastArg = node.arguments[node.arguments.length - 1];

        const hasDelay =
          isObjectExpression(lastArg) &&
          lastArg.properties.some(
            (property) =>
              isProperty(property) &&
              ASTUtils.isIdentifier(property.key) &&
              property.key.name === 'delay' &&
              isLiteral(property.value) &&
              !!property.value.value &&
              property.value.value > 0
          );

        const simulateEventFunctionName = simulateEventFunctionIdentifier.name;

        if (
          USER_EVENT_ASYNC_EXCEPTIONS.includes(simulateEventFunctionName) &&
          hasDelay
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'noAwaitSyncEvents',
          data: {
            name: `${
              getPropertyIdentifierNode(node)?.name
            }.${simulateEventFunctionName}`,
          },
        });
      },
    };
  },
});
