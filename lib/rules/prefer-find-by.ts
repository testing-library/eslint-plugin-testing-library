import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import {
  isIdentifier,
  isCallExpression,
  isMemberExpression,
  isArrowFunctionExpression,
} from '../node-utils';
import { getDocsUrl, SYNC_QUERIES_COMBINATIONS } from '../utils';

export const RULE_NAME = 'prefer-find-by';

type Options = [];
export type MessageIds = 'preferFindBy';

export const WAIT_METHODS = ['waitFor', 'waitForElement', 'wait']

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest using find* instead of waitFor to wait for elements',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      preferFindBy: 'Prefer {{queryVariant}}{{queryMethod}} method over using await {{fullQuery}}'
    },
    fixable: null,
    schema: []
  },
  defaultOptions: [],

  create(context) {

    function reportInvalidUsage(node: TSESTree.CallExpression, { queryVariant, queryMethod, fullQuery }: { queryVariant: string, queryMethod: string, fullQuery: string}) {
      context.report({
        node,
        messageId: "preferFindBy",
        data: { queryVariant, queryMethod, fullQuery },
      });
    }

    const sourceCode = context.getSourceCode();

    return {
      'AwaitExpression > CallExpression'(node: TSESTree.CallExpression) {
        if (!isIdentifier(node.callee) || !WAIT_METHODS.includes(node.callee.name)) {
          return
        }
        // ensure the only argument is an arrow function expression - if the arrow function is a block
        // we skip it
        const argument = node.arguments[0]
        if (!isArrowFunctionExpression(argument)) {
          return
        }
        if (!isCallExpression(argument.body)) {
          return
        }
        // ensure here it's one of the sync methods that we are calling
        if (isMemberExpression(argument.body.callee) && isIdentifier(argument.body.callee.property) && isIdentifier(argument.body.callee.object) && SYNC_QUERIES_COMBINATIONS.includes(argument.body.callee.property.name)) {
          // shape of () => screen.getByText
          const queryMethod = argument.body.callee.property.name
          reportInvalidUsage(node, {
            queryMethod: queryMethod.split('By')[1],
            queryVariant: getFindByQueryVariant(queryMethod),
            fullQuery: sourceCode.getText(node)
          })
          return
        }
        if (isIdentifier(argument.body.callee) && SYNC_QUERIES_COMBINATIONS.includes(argument.body.callee.name)) {
          // shape of () => getByText
          const queryMethod = argument.body.callee.name
          reportInvalidUsage(node, {
            queryMethod: queryMethod.split('By')[1],
            queryVariant: getFindByQueryVariant(queryMethod),
            fullQuery: sourceCode.getText(node)
          })
          return
        }
      }
    }
  }
})

function getFindByQueryVariant(queryMethod: string) {
  return queryMethod.includes('All') ? 'findAllBy' : 'findBy'
}