import { TSESTree } from '@typescript-eslint/experimental-utils';
import {
  getPropertyIdentifierNode,
  isExpressionStatement,
} from '../node-utils';
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
    schema: [],
  },
  defaultOptions: [],
  create: function (context, _, helpers) {
    function isCallerWaitFor(
      node: TSESTree.BlockStatement | TSESTree.CallExpression
    ) {
      if (!node.parent) {
        return false;
      }
      const callExpressionNode = node.parent.parent as TSESTree.CallExpression;
      const callExpressionIdentifier = getPropertyIdentifierNode(
        callExpressionNode
      );

      if (!callExpressionIdentifier) {
        return false;
      }

      if (!helpers.isAsyncUtil(callExpressionIdentifier, ['waitFor'])) {
        return false;
      }

      return true;
    }

    function getSideEffectNodes(
      body: TSESTree.Node[]
    ): TSESTree.ExpressionStatement[] {
      return body.filter((node) => {
        if (!isExpressionStatement(node)) {
          return false;
        }

        const expressionIdentifier = getPropertyIdentifierNode(node);
        if (!expressionIdentifier) {
          return false;
        }

        return (
          helpers.isFireEventUtil(expressionIdentifier) ||
          helpers.isUserEventUtil(expressionIdentifier)
        );
      }) as TSESTree.ExpressionStatement[];
    }

    function reportSideEffects(node: TSESTree.BlockStatement) {
      if (!isCallerWaitFor(node)) {
        return;
      }

      const sideEffectNodes = getSideEffectNodes(node.body);
      if (sideEffectNodes.length === 0) {
        return;
      }

      for (const sideEffectNode of sideEffectNodes) {
        context.report({
          node: sideEffectNode,
          messageId: 'noSideEffectsWaitFor',
        });
      }
    }

    function reportImplicitReturnSideEffect(node: TSESTree.CallExpression) {
      if (!isCallerWaitFor(node)) {
        return;
      }

      const expressionIdentifier = getPropertyIdentifierNode(node.callee);
      if (!expressionIdentifier) {
        return false;
      }

      if (
        !helpers.isFireEventUtil(expressionIdentifier) &&
        !helpers.isUserEventUtil(expressionIdentifier)
      ) {
        return;
      }

      context.report({
        node,
        messageId: 'noSideEffectsWaitFor',
      });
    }

    return {
      'CallExpression > ArrowFunctionExpression > BlockStatement': reportSideEffects,
      'CallExpression > ArrowFunctionExpression > CallExpression': reportImplicitReturnSideEffect,
      'CallExpression > FunctionExpression > BlockStatement': reportSideEffects,
    };
  },
});
