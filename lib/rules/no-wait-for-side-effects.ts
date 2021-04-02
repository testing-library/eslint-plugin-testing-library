import { TSESTree } from '@typescript-eslint/experimental-utils';
import { getPropertyIdentifierNode } from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'no-wait-for-side-effects';
export type MessageIds = 'noSideEffectsWaitFor';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: "It's preferred to avoid side effects in `waitFor`",
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noSideEffectsWaitFor:
        'Avoid using side effects within `waitFor` callback',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],
  create: function (context, _, helpers) {
    function hasSideEffects(body: Array<TSESTree.Node>): boolean {
      return body.some((node: TSESTree.ExpressionStatement) => {
        const expressionIdentifier = getPropertyIdentifierNode(node);

        if (!expressionIdentifier) {
          return false;
        }

        return (
          helpers.isFireEventUtil(expressionIdentifier) ||
          helpers.isUserEventUtil(expressionIdentifier)
        );
      });
    }

    function reportSideEffects(node: TSESTree.BlockStatement) {
      const callExpressionNode = node.parent.parent as TSESTree.CallExpression;
      const callExpressionIdentifier = getPropertyIdentifierNode(
        callExpressionNode
      );

      if (!callExpressionIdentifier) {
        return;
      }

      if (!helpers.isAsyncUtil(callExpressionIdentifier, ['waitFor'])) {
        return;
      }

      if (!hasSideEffects(node.body)) {
        return;
      }

      context.report({
        node: callExpressionNode,
        messageId: 'noSideEffectsWaitFor',
      });
    }

    return {
      'CallExpression > ArrowFunctionExpression > BlockStatement': reportSideEffects,
      'CallExpression > FunctionExpression > BlockStatement': reportSideEffects,
    };
  },
});
