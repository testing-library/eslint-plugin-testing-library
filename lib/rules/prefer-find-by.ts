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
    fixable: 'code',
    schema: []
  },
  defaultOptions: [],

  create(context) {
    const sourceCode = context.getSourceCode();

    /**
     * Reports the invalid usage of wait* plus getBy/QueryBy methods and automatically fixes the scenario
     * @param {TSESTree.CallExpression} node - The CallExpresion node that contains the wait* method
     * @param {'findBy' | 'findAllBy'} replacementParams.queryVariant - The variant method used to query: findBy/findByAll.
     * @param {string} replacementParams.queryMethod - Suffix string to build the query method (the query-part that comes after the "By"): LabelText, Placeholder, Text, Role, Title, etc.
     * @param {Array<TSESTree.Expression>} replacementParams.callArguments - Array of argument nodes which contain the parameters of the query inside the wait* method.
     * @param {string=} replacementParams.caller - the variable name that targets screen or the value returned from `render` function.
     */
    function reportInvalidUsage(node: TSESTree.CallExpression, { queryVariant, queryMethod, callArguments, caller }: { queryVariant: 'findBy' | 'findAllBy', queryMethod: string, callArguments: TSESTree.Expression[], caller?: string }) {
      
      context.report({
        node,
        messageId: "preferFindBy",
        data: { queryVariant, queryMethod, fullQuery: sourceCode.getText(node) },
        fix(fixer) {
          const newCode = `${caller ? `${caller}.` : ''}${queryVariant}${queryMethod}(${callArguments.map((node) => sourceCode.getText(node)).join(', ')})`
          return fixer.replaceText(node, newCode)
        }
      });
    }

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
          const caller = argument.body.callee.object.name
          
          reportInvalidUsage(node, {
            queryMethod: queryMethod.split('By')[1],
            queryVariant: getFindByQueryVariant(queryMethod),
            callArguments: argument.body.arguments,
            caller,
          })
          return
        }
        if (isIdentifier(argument.body.callee) && SYNC_QUERIES_COMBINATIONS.includes(argument.body.callee.name)) {
          // shape of () => getByText
          const queryMethod = argument.body.callee.name
          reportInvalidUsage(node, {
            queryMethod: queryMethod.split('By')[1],
            queryVariant: getFindByQueryVariant(queryMethod),
            callArguments: argument.body.arguments,
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