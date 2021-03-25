import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import {
  getDeepestIdentifierNode,
  isCallExpression,
  isMemberExpression,
} from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'no-side-effects-wait-for';
export type MessageIds = 'noSideEffectsWaitFor';
type Options = [];

const SIDE_EFFECTS: Array<string> = ['fireEvent', 'userEvent'];

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
        if (
          isCallExpression(node.expression) &&
          isMemberExpression(node.expression.callee) &&
          ASTUtils.isIdentifier(node.expression.callee.object)
        ) {
          const object: TSESTree.Identifier = node.expression.callee.object;
          // TODO: check here if `object` is fireEvent or userEvent using helpers
          const identifierName: string = object.name;
          return SIDE_EFFECTS.includes(identifierName);
        } else {
          return false;
        }
      });
    }

    function reportSideEffects(node: TSESTree.BlockStatement) {
      const callExpressionNode = node.parent.parent as TSESTree.CallExpression;
      const callExpressionIdentifier = getDeepestIdentifierNode(
        callExpressionNode
      );

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
