import { TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  getPropertyIdentifierNode,
  isExpressionStatement,
  isVariableDeclaration,
  isAssignmentExpression,
  isCallExpression,
  isSequenceExpression,
} from '../node-utils';

export const RULE_NAME = 'no-wait-for-side-effects';
export type MessageIds = 'noSideEffectsWaitFor';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the use of side effects in `waitFor`',
      recommendedConfig: {
        dom: 'error',
        angular: 'error',
        react: 'error',
        vue: 'error',
        marko: 'error',
      },
    },
    messages: {
      noSideEffectsWaitFor:
        'Avoid using side effects within `waitFor` callback',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context, _, helpers) {
    function isCallerWaitFor(
      node:
        | TSESTree.AssignmentExpression
        | TSESTree.BlockStatement
        | TSESTree.CallExpression
        | TSESTree.SequenceExpression
    ): boolean {
      if (!node.parent) {
        return false;
      }
      const callExpressionNode = node.parent.parent as TSESTree.CallExpression;
      const callExpressionIdentifier =
        getPropertyIdentifierNode(callExpressionNode);

      return (
        !!callExpressionIdentifier &&
        helpers.isAsyncUtil(callExpressionIdentifier, ['waitFor'])
      );
    }

    function isRenderInVariableDeclaration(node: TSESTree.Node) {
      return (
        isVariableDeclaration(node) &&
        node.declarations.some(helpers.isRenderVariableDeclarator)
      );
    }

    function isRenderInExpressionStatement(node: TSESTree.Node) {
      if (
        !isExpressionStatement(node) ||
        !isAssignmentExpression(node.expression)
      ) {
        return false;
      }

      const expressionIdentifier = getPropertyIdentifierNode(
        node.expression.right
      );

      if (!expressionIdentifier) {
        return false;
      }

      return helpers.isRenderUtil(expressionIdentifier);
    }

    function isRenderInAssignmentExpression(node: TSESTree.Node) {
      if (!isAssignmentExpression(node)) {
        return false;
      }

      const expressionIdentifier = getPropertyIdentifierNode(node.right);
      if (!expressionIdentifier) {
        return false;
      }

      return helpers.isRenderUtil(expressionIdentifier);
    }

    function isRenderInSequenceAssignment(node: TSESTree.Node) {
      if (!isSequenceExpression(node)) {
        return false;
      }

      return node.expressions.some(isRenderInAssignmentExpression);
    }

    function getSideEffectNodes(
      body: TSESTree.Node[]
    ): TSESTree.ExpressionStatement[] {
      return body.filter((node) => {
        if (!isExpressionStatement(node) && !isVariableDeclaration(node)) {
          return false;
        }

        if (
          isRenderInVariableDeclaration(node) ||
          isRenderInExpressionStatement(node)
        ) {
          return true;
        }

        const expressionIdentifier = getPropertyIdentifierNode(node);

        if (!expressionIdentifier) {
          return false;
        }

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

      getSideEffectNodes(node.body).forEach((sideEffectNode) =>
        context.report({
          node: sideEffectNode,
          messageId: 'noSideEffectsWaitFor',
        })
      );
    }

    function reportImplicitReturnSideEffect(
      node:
        | TSESTree.AssignmentExpression
        | TSESTree.CallExpression
        | TSESTree.SequenceExpression
    ) {
      if (!isCallerWaitFor(node)) {
        return;
      }

      const expressionIdentifier = isCallExpression(node)
        ? getPropertyIdentifierNode(node.callee)
        : null;

      if (
        !expressionIdentifier &&
        !isRenderInAssignmentExpression(node) &&
        !isRenderInSequenceAssignment(node)
      ) {
        return;
      }

      if (
        expressionIdentifier &&
        !helpers.isFireEventUtil(expressionIdentifier) &&
        !helpers.isUserEventUtil(expressionIdentifier) &&
        !helpers.isRenderUtil(expressionIdentifier)
      ) {
        return;
      }

      context.report({
        node,
        messageId: 'noSideEffectsWaitFor',
      });
    }

    return {
      'CallExpression > ArrowFunctionExpression > BlockStatement':
        reportSideEffects,
      'CallExpression > ArrowFunctionExpression > CallExpression':
        reportImplicitReturnSideEffect,
      'CallExpression > ArrowFunctionExpression > AssignmentExpression':
        reportImplicitReturnSideEffect,
      'CallExpression > ArrowFunctionExpression > SequenceExpression':
        reportImplicitReturnSideEffect,
      'CallExpression > FunctionExpression > BlockStatement': reportSideEffects,
    };
  },
});
