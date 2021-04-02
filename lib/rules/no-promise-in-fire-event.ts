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
    function checkSuspiciousNode(
      node: TSESTree.Node,
      originalNode?: TSESTree.Node
    ): void {
      if (ASTUtils.isAwaitExpression(node)) {
        return;
      }

      if (isNewExpression(node)) {
        if (isPromiseIdentifier(node.callee)) {
          return context.report({
            node: originalNode ?? node,
            messageId: 'noPromiseInFireEvent',
          });
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
          return context.report({
            node: originalNode ?? node,
            messageId: 'noPromiseInFireEvent',
          });
        }
      }

      if (ASTUtils.isIdentifier(node)) {
        const nodeVariable = ASTUtils.findVariable(
          context.getScope(),
          node.name
        );
        if (!nodeVariable || !nodeVariable.defs) {
          return;
        }

        for (const definition of nodeVariable.defs) {
          const variableDeclarator = definition.node as TSESTree.VariableDeclarator;
          checkSuspiciousNode(variableDeclarator.init, node);
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
