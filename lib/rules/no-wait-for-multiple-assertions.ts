import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import {
  isBlockStatement,
  isCallExpression,
  isMemberExpression,
} from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'no-wait-for-multiple-assertions';
export type MessageIds = 'noWaitForMultipleAssertion';
type Options = [];

const WAIT_EXPRESSION_QUERY = 'CallExpression[callee.name=/^(waitFor)$/]';

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
  create: function (context) {
    function reportMultipleAssertion(node: TSESTree.BlockStatement) {
      const totalExpect = (body: Array<TSESTree.Node>): Array<TSESTree.Node> =>
        body.filter((node: TSESTree.ExpressionStatement) => {
          if (
            isCallExpression(node.expression) &&
            isMemberExpression(node.expression.callee) &&
            isCallExpression(node.expression.callee.object)
          ) {
            const object: TSESTree.CallExpression =
              node.expression.callee.object;
            const expressionName: string =
              ASTUtils.isIdentifier(object.callee) && object.callee.name;
            return expressionName === 'expect';
          } else {
            return false;
          }
        });

      if (isBlockStatement(node) && totalExpect(node.body).length > 1) {
        context.report({
          node,
          loc: node.loc.start,
          messageId: 'noWaitForMultipleAssertion',
        });
      }
    }

    return {
      [`${WAIT_EXPRESSION_QUERY} > ArrowFunctionExpression > BlockStatement`]: reportMultipleAssertion,
      [`${WAIT_EXPRESSION_QUERY} > FunctionExpression > BlockStatement`]: reportMultipleAssertion,
    };
  },
});
