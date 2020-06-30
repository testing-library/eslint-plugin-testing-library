import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils'
import { getDocsUrl } from '../utils'
import { isBlockStatement, findClosestCallNode, isMemberExpression, isCallExpression, isIdentifier } from '../node-utils'

export const RULE_NAME = 'no-multiple-assertions-wait-for';

const WAIT_EXPRESSION_QUERY =
  'CallExpression[callee.name=/^(waitFor)$/]';

export type MessageIds = 'noMultipleAssertionWaitFor';
type Options = [];

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "It's preferred to avoid multiple assertions in `waitFor`",
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noMultipleAssertionWaitFor: 'Avoid use multiple assertions to `waitFor`',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],
  create: function(context) {
    function reportMultipleAssertion(
      node: TSESTree.BlockStatement
    ) {
      const totalExpect = (body: Array<TSESTree.Node>): Array<TSESTree.Node> =>
        body.filter((node: TSESTree.ExpressionStatement) => {
          if (
            isCallExpression(node.expression) &&
            isMemberExpression(node.expression.callee) &&
            isCallExpression(node.expression.callee.object)
          ) {
            const object: TSESTree.CallExpression = node.expression.callee.object
            const expressionName: string = isIdentifier(object.callee) && object.callee.name
            return expressionName === 'expect'
          } else {
            return false
          }
        })

      if (isBlockStatement(node) && totalExpect(node.body).length > 1) {
        context.report({
          node,
          loc: node.loc.start,
          messageId: 'noMultipleAssertionWaitFor',
        });
      }
    }

    return {
      [`${WAIT_EXPRESSION_QUERY} > ArrowFunctionExpression > BlockStatement`]: reportMultipleAssertion,
      [`${WAIT_EXPRESSION_QUERY} > FunctionExpression > BlockStatement`]: reportMultipleAssertion,
    };
  }
})
