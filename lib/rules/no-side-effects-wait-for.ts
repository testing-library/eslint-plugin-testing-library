import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils'
import { getDocsUrl, hasTestingLibraryImportModule } from '../utils'
import { isBlockStatement, findClosestCallNode, isMemberExpression, isCallExpression, isIdentifier } from '../node-utils'

export const RULE_NAME = 'no-side-effects-wait-for';

const WAIT_EXPRESSION_QUERY =
  'CallExpression[callee.name=/^(waitFor)$/]';

const SIDE_EFFECTS: Array<string> = ['fireEvent', 'userEvent']

export type MessageIds = 'noSideEffectsWaitFor';
type Options = [];

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "It's preferred to avoid side effects in `waitFor`",
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noSideEffectsWaitFor: 'Avoid using side effects within `waitFor` callback',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],
  create: function(context) {
    let isImportingTestingLibrary = false;

    function reportSideEffects(
      node: TSESTree.BlockStatement
    ) {
      const hasSideEffects = (body: Array<TSESTree.Node>): boolean =>
        body.some((node: TSESTree.ExpressionStatement) => {
          if (
            isCallExpression(node.expression) &&
            isMemberExpression(node.expression.callee) &&
            isIdentifier(node.expression.callee.object)
          ) {
            const object: TSESTree.Identifier = node.expression.callee.object
            const identifierName: string = object.name
            return SIDE_EFFECTS.includes(identifierName)
          } else {
            return false
          }
        })

      if (isImportingTestingLibrary && isBlockStatement(node) && hasSideEffects(node.body)) {
        context.report({
          node,
          loc: node.loc.start,
          messageId: 'noSideEffectsWaitFor',
        });
      }
    }

    return {
      [`${WAIT_EXPRESSION_QUERY} > ArrowFunctionExpression > BlockStatement`]: reportSideEffects,
      [`${WAIT_EXPRESSION_QUERY} > FunctionExpression > BlockStatement`]: reportSideEffects,
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        isImportingTestingLibrary = hasTestingLibraryImportModule(node);
      }
    };
  }
})
