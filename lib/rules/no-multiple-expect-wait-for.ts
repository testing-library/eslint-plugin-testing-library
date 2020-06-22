import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils'
import { getDocsUrl } from '../utils'
import { isBlockStatement } from '../node-utils'

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
      if (isBlockStatement(node) && node.body.length > 1) {
        const waitForCall: TSESTree.CallExpression = node.parent.parent as TSESTree.CallExpression
        const waitForIdentifier: TSESTree.Identifier = waitForCall.callee as TSESTree.Identifier
        const methodName = waitForIdentifier.name

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
