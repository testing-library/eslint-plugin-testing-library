import { TSESTree } from '@typescript-eslint/experimental-utils';
import { getPropertyIdentifierNode } from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'no-wait-for-multiple-assertions';
export type MessageIds = 'noWaitForMultipleAssertion';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: "It's preferred to avoid multiple assertions in `waitFor`",
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noWaitForMultipleAssertion:
        'Avoid using multiple assertions within `waitFor` callback',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],
  create: function (context, _, helpers) {
    function totalExpect(body: Array<TSESTree.Node>): Array<TSESTree.Node> {
      return body.filter((node: TSESTree.ExpressionStatement) => {
        const expressionIdentifier = getPropertyIdentifierNode(node);

        if (!expressionIdentifier) {
          return false;
        }

        return expressionIdentifier.name === 'expect';
      });
    }

    function reportMultipleAssertion(node: TSESTree.BlockStatement) {
      const callExpressionNode = node.parent.parent as TSESTree.CallExpression;
      const callExpressionIdentifier = getPropertyIdentifierNode(
        callExpressionNode
      );

      if (!helpers.isAsyncUtil(callExpressionIdentifier, ['waitFor'])) {
        return;
      }

      if (totalExpect(node.body).length <= 1) {
        return;
      }

      context.report({
        node: callExpressionNode,
        messageId: 'noWaitForMultipleAssertion',
      });
    }

    return {
      'CallExpression > ArrowFunctionExpression > BlockStatement': reportMultipleAssertion,
      'CallExpression > FunctionExpression > BlockStatement': reportMultipleAssertion,
    };
  },
});
