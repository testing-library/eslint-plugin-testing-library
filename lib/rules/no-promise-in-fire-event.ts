import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  findClosestCallExpressionNode,
  getIdentifierNode,
  isCallExpression,
  isNewExpression,
  isPromiseIdentifier,
} from '../node-utils';

export const RULE_NAME = 'no-promise-in-fire-event';
export type MessageIds = 'noPromiseInFireEvent';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow the use of promises passed to a `fireEvent` method',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noPromiseInFireEvent:
        "A promise shouldn't be passed to a `fireEvent` method, instead pass the DOM element",
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    return {
      'CallExpression Identifier'(node: TSESTree.Identifier) {
        if (!helpers.isFireEventMethod(node)) {
          return;
        }

        const closestCallExpression = findClosestCallExpressionNode(node, true);

        if (!closestCallExpression) {
          return;
        }

        const domElementArgument = closestCallExpression.arguments[0];

        if (ASTUtils.isAwaitExpression(domElementArgument)) {
          return;
        }

        if (isNewExpression(domElementArgument)) {
          if (isPromiseIdentifier(domElementArgument.callee)) {
            return context.report({
              node: domElementArgument,
              messageId: 'noPromiseInFireEvent',
            });
          }
        }

        if (isCallExpression(domElementArgument)) {
          const domElementIdentifier = getIdentifierNode(domElementArgument);

          if (!domElementIdentifier) {
            return;
          }

          if (
            helpers.isAsyncQuery(domElementIdentifier) ||
            isPromiseIdentifier(domElementIdentifier)
          ) {
            return context.report({
              node: domElementArgument,
              messageId: 'noPromiseInFireEvent',
            });
          }
        }
      },
    };
  },
});
