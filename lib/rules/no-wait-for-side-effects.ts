import { TSESTree } from '@typescript-eslint/experimental-utils';
import {
  getPropertyIdentifierNode,
  isExpressionStatement,
  isVariableDeclaration,
  isAssignmentExpression,
  isCallExpression,
  isSequenceExpression,
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
      recommendedConfig: {
        dom: false,
        angular: false,
        react: false,
        vue: false,
      },
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
      node:
        | TSESTree.BlockStatement
        | TSESTree.CallExpression
        | TSESTree.AssignmentExpression
        | TSESTree.SequenceExpression
    ): boolean {
      if (!node.parent) {
        return false;
      }
      const callExpressionNode = node.parent.parent as TSESTree.CallExpression;
      const callExpressionIdentifier = getPropertyIdentifierNode(
        callExpressionNode
      );

      return (
        !!callExpressionIdentifier &&
        helpers.isAsyncUtil(callExpressionIdentifier, ['waitFor'])
      );
    }

    function isRenderInVariableDeclaration(node: TSESTree.Node) {
      return (
        isVariableDeclaration(node) &&
        node.declarations.some((declaration) =>
          helpers.isRenderVariableDeclarator(declaration)
        )
      );
    }

    function isRenderInAssignment(node: TSESTree.Node) {
      return (
        isExpressionStatement(node) &&
        isAssignmentExpression(node.expression) &&
        helpers.isRenderUtil(getPropertyIdentifierNode(node.expression.right))
      );
    }

    function isRenderInImplicitReturnAssignment(node: TSESTree.Node) {
      return (
        isAssignmentExpression(node) &&
        helpers.isRenderUtil(getPropertyIdentifierNode(node.right))
      );
    }

    function isRenderInSequenceAssignment(node: TSESTree.Node) {
      return (
        isSequenceExpression(node) &&
        node.expressions.some(
          (expression) =>
            isAssignmentExpression(expression) &&
            helpers.isRenderUtil(getPropertyIdentifierNode(expression.right))
        )
      );
    }

    function getSideEffectNodes(
      body: TSESTree.Node[]
    ): TSESTree.ExpressionStatement[] {
      return body.filter((node) => {
        if (!isExpressionStatement(node) && !isVariableDeclaration(node)) {
          return false;
        }

        if (isRenderInVariableDeclaration(node) || isRenderInAssignment(node)) {
          return true;
        }

        const expressionIdentifier = getPropertyIdentifierNode(node);

        return (
          helpers.isFireEventUtil(expressionIdentifier) ||
          helpers.isUserEventUtil(expressionIdentifier) ||
          helpers.isRenderUtil(expressionIdentifier)
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

    function reportImplicitReturnSideEffect(
      node:
        | TSESTree.CallExpression
        | TSESTree.AssignmentExpression
        | TSESTree.SequenceExpression
    ) {
      if (!isCallerWaitFor(node)) {
        return;
      }

      const expressionIdentifier = isCallExpression(node)
        ? getPropertyIdentifierNode(node.callee)
        : null;

      if (
        !helpers.isFireEventUtil(expressionIdentifier) &&
        !helpers.isUserEventUtil(expressionIdentifier) &&
        !helpers.isRenderUtil(expressionIdentifier) &&
        !isRenderInImplicitReturnAssignment(node) &&
        !isRenderInSequenceAssignment(node)
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
      'CallExpression > ArrowFunctionExpression > AssignmentExpression': reportImplicitReturnSideEffect,
      'CallExpression > ArrowFunctionExpression > SequenceExpression': reportImplicitReturnSideEffect,
      'CallExpression > FunctionExpression > BlockStatement': reportSideEffects,
    };
  },
});
