import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  findClosestCallExpressionNode,
  getFunctionName,
  getInnermostReturningFunction,
  getVariableReferences,
  isPromiseHandled,
} from '../node-utils';

export const RULE_NAME = 'await-fire-event';
export type MessageIds = 'awaitFireEvent' | 'fireEventWrapper';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce promises from `fireEvent` methods to be handled',
      recommendedConfig: {
        dom: false,
        angular: false,
        react: false,
        vue: 'error',
      },
    },
    messages: {
      awaitFireEvent:
        'Promise returned from `fireEvent.{{ methodName }}` must be handled',
      fireEventWrapper:
        'Promise returned from `fireEvent.{{ wrapperName }}` wrapper over fire event method must be handled',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    const functionWrappersNames: string[] = [];

    function reportUnhandledNode(
      node: TSESTree.Identifier,
      closestCallExpressionNode: TSESTree.CallExpression,
      messageId: MessageIds = 'awaitFireEvent'
    ): void {
      if (!isPromiseHandled(node)) {
        context.report({
          node: closestCallExpressionNode.callee,
          messageId,
          data: { name: node.name },
        });
      }
    }

    function detectFireEventMethodWrapper(node: TSESTree.Identifier): void {
      const innerFunction = getInnermostReturningFunction(context, node);

      if (innerFunction) {
        functionWrappersNames.push(getFunctionName(innerFunction));
      }
    }

    return {
      'CallExpression Identifier'(node: TSESTree.Identifier) {
        if (helpers.isFireEventMethod(node)) {
          detectFireEventMethodWrapper(node);

          const closestCallExpression = findClosestCallExpressionNode(
            node,
            true
          );

          if (!closestCallExpression || !closestCallExpression.parent) {
            return;
          }

          const references = getVariableReferences(
            context,
            closestCallExpression.parent
          );

          if (references.length === 0) {
            reportUnhandledNode(node, closestCallExpression);
          } else {
            for (const reference of references) {
              if (ASTUtils.isIdentifier(reference.identifier)) {
                reportUnhandledNode(
                  reference.identifier,
                  closestCallExpression
                );
              }
            }
          }
        } else if (functionWrappersNames.includes(node.name)) {
          // report promise returned from function wrapping fire event method
          // previously detected
          const closestCallExpression = findClosestCallExpressionNode(
            node,
            true
          );

          if (!closestCallExpression) {
            return;
          }

          reportUnhandledNode(node, closestCallExpression, 'fireEventWrapper');
        }
      },
    };
  },
});
