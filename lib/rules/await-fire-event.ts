import { TSESTree } from '@typescript-eslint/experimental-utils';
import {
  findClosestCallExpressionNode,
  getVariableReferences,
  isPromiseHandled,
} from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'await-fire-event';
export type MessageIds = 'awaitFireEvent' | 'fireEventWrapper';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce promises from fire event methods to be handled',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      awaitFireEvent:
        'Promise returned from `fireEvent.{{ methodName }}` must be handled',
      fireEventWrapper:
        'Promise returned from `fireEvent.{{ wrapperName }}` wrapper over fire event method must be handled',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create: function (context, _, helpers) {
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

    return {
      'CallExpression Identifier'(node: TSESTree.Identifier) {
        if (helpers.isFireEventMethod(node)) {
          // TODO: detectFireEventMethodWrapper

          const closestCallExpression = findClosestCallExpressionNode(
            node,
            true
          );

          if (!closestCallExpression) {
            return;
          }

          const references = getVariableReferences(
            context,
            closestCallExpression.parent
          );

          if (!references || references.length === 0) {
            return reportUnhandledNode(node, closestCallExpression);
          } else {
            for (const reference of references) {
              const referenceNode = reference.identifier as TSESTree.Identifier;
              return reportUnhandledNode(referenceNode, closestCallExpression);
            }
          }
        }
      },
    };
  },
});
