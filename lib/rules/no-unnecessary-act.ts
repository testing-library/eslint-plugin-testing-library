import { TSESTree, ASTUtils } from '@typescript-eslint/experimental-utils';
import {
  isBlockStatement,
  isCallExpression,
  isMemberExpression
} from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'no-unnecessary-act';
export type MessageIds = 'noUnnecessaryAct';
type Options = [];

const ACT_EXPRESSION_QUERY = 'CallExpression[callee.name=/^(act)$/]';

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow the use of `act` when wrapping Testing Library functions or functions with an empty body',
      category: 'Best Practices',
      recommended: false
    },
    messages: {
      noUnnecessaryAct:
        'Avoid wrapping Testing Library functions in `act` as they are wrapped in act automatically, and avoid wrapping noop functions in `act` as they suppress valid warnings.'
    },
    fixable: null,
    schema: []
  },
  defaultOptions: [],

  create(context, _, helpers) {
    function reportIfUnnecessary(
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression
    ) {
      let isEmpty = false;
      let callsTL = false;
      const callsOnlyTLFns = (body: Array<TSESTree.Node>): boolean =>
        body.every((node: TSESTree.ExpressionStatement) => {
          if (
            isCallExpression(node.expression) &&
            isMemberExpression(node.expression.callee) &&
            isCallExpression(node.expression.callee.object) &&
            helpers.isNodeComingFromTestingLibrary(node.expression.callee)
          ) {
            return true;
          }
          return false;
        });
      if (
        isBlockStatement(node.body) &&
        node.body.body.length === 0 &&
        isCallExpression(node.parent) &&
        ASTUtils.isIdentifier(node.parent.callee)
      ) {
        isEmpty = true;
      }
      if (
        isCallExpression(node.body) &&
        isMemberExpression(node.body.callee) &&
        helpers.isNodeComingFromTestingLibrary(node.body.callee)
      ) {
        callsTL = true;
      }
      if (
        isEmpty ||
        callsTL ||
        (isBlockStatement(node.body) && callsOnlyTLFns(node.body.body))
      ) {
        context.report({
          node,
          loc: node.body.loc.start,
          messageId: 'noUnnecessaryAct'
        });
      }
    }

    return {
      [`${ACT_EXPRESSION_QUERY} > ArrowFunctionExpression`]: reportIfUnnecessary,
      [`${ACT_EXPRESSION_QUERY} > FunctionExpression`]: reportIfUnnecessary
    };
  }
});
