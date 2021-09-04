import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  findClosestCallExpressionNode,
  getDeepestIdentifierNode,
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
      recommendedConfig: {
        dom: 'error',
        angular: 'error',
        react: 'error',
        vue: 'error',
      },
    },
    messages: {
      noPromiseInFireEvent:
        "A promise shouldn't be passed to a `fireEvent` method, instead pass the DOM element",
    },
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    function checkSuspiciousNode(
      node: TSESTree.Node,
      originalNode?: TSESTree.Node
    ): void {
      if (ASTUtils.isAwaitExpression(node)) {
        return;
      }

      if (isNewExpression(node)) {
        if (isPromiseIdentifier(node.callee)) {
          context.report({
            node: originalNode ?? node,
            messageId: 'noPromiseInFireEvent',
          });
          return;
        }
      }

      if (isCallExpression(node)) {
        const domElementIdentifier = getDeepestIdentifierNode(node);

        if (!domElementIdentifier) {
          return;
        }

        if (
          helpers.isAsyncQuery(domElementIdentifier) ||
          isPromiseIdentifier(domElementIdentifier)
        ) {
          context.report({
            node: originalNode ?? node,
            messageId: 'noPromiseInFireEvent',
          });
          return;
        }
      }

      if (ASTUtils.isIdentifier(node)) {
        const nodeVariable = ASTUtils.findVariable(
          context.getScope(),
          node.name
        );
        if (!nodeVariable) {
          return;
        }

        for (const definition of nodeVariable.defs) {
          const variableDeclarator =
            definition.node as TSESTree.VariableDeclarator;
          if (variableDeclarator.init) {
            checkSuspiciousNode(variableDeclarator.init, node);
          }
        }
      }
    }

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

        checkSuspiciousNode(domElementArgument);
      },
    };
  },
});
