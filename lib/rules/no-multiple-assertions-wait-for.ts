import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils'
import { getDocsUrl } from '../utils'
import { isBlockStatement, findClosestCalleName, isMemberExpression, isCallExpression, isIdentifier } from '../node-utils'

export const RULE_NAME = 'no-multiple-expect-wait-for';

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
      noMultipleAssertionWaitFor: 'Avoid use multiple assertions to `{{ methodName }}`',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],
  create: function(context) {
    function reporttMultipleAssertion(
      node: TSESTree.BlockStatement
    ) {
      const hasMultipleExpects = (body: Array<TSESTree.Node>): boolean =>
        body.every((node: TSESTree.ExpressionStatement) => {
          if (
            isCallExpression(node?.expression) &&
            isMemberExpression(node?.expression?.callee) &&
            isCallExpression(node?.expression?.callee?.object)
          ) {
            const object: TSESTree.CallExpression = node?.expression?.callee?.object
            const expressionName: string = (object?.callee as TSESTree.Identifier)?.name
            return expressionName === 'expect'
          } else {
            return false
          }
        })

      if (isBlockStatement(node) && node.body.length > 1 && hasMultipleExpects(node.body)) {
        const methodName: string = findClosestCalleName(node)
        context.report({
          node,
          loc: node.loc.start,
          messageId: 'noMultipleAssertionWaitFor',
          data: {
            methodName,
          },
        });
      }
    }

    return {
      [`${WAIT_EXPRESSION_QUERY} > ArrowFunctionExpression > BlockStatement`]: reporttMultipleAssertion,
      [`${WAIT_EXPRESSION_QUERY} > FunctionExpression > BlockStatement`]: reporttMultipleAssertion,
    };
  }
})
