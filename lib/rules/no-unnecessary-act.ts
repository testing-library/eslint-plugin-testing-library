import { TSESTree, ASTUtils } from '@typescript-eslint/experimental-utils';
import {
  isBlockStatement,
  isCallExpression
  // isMemberExpression
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
    // need to find all instances of `act` and check whether:
    //   1. callback body is empty = act unnecessary ✅
    //   2. callback contains a non-RTL function call = act is permitted
    //   3. import ReactTestUtils from 'react-dom/test-utils' // ReactTestUtils should be treated the same as act ✅

    function reportIfUnnecessary(
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression
    ) {
      let isEmpty = false;
      if (
        isBlockStatement(node.body) &&
        node.body.body.length === 0 &&
        isCallExpression(node.parent) &&
        ASTUtils.isIdentifier(node.parent.callee)
      ) {
        isEmpty = true;
      }
      // console.log(node);
      if (isEmpty) {
        context.report({
          node,
          loc: node.body.loc.start,
          messageId: 'noUnnecessaryAct'
        });
      }
    }

    function reportTLNode(node: TSESTree.MemberExpression) {
      // console.log(node, helpers.isNodeComingFromTestingLibrary(node));
      if (
        !isBlockStatement(node.parent) ||
        helpers.isNodeComingFromTestingLibrary(node)
      ) {
        context.report({
          node,
          messageId: 'noUnnecessaryAct'
        });
      }
    }

    // function reportTLNodeBlockStatement(node: TSESTree.BlockStatement) {
    //   const callsTLFunction = (body: Array<TSESTree.Node>): boolean =>
    //     body.some((node: TSESTree.ExpressionStatement) => {
    //       if (
    //         isCallExpression(node.expression) &&
    //         isMemberExpression(node.expression.callee) &&
    //         isCallExpression(node.expression.callee.object) &&
    //         helpers.isNodeComingFromTestingLibrary(node.expression.callee)
    //       ) {
    //         return true;
    //       } else {
    //         return false;
    //       }
    //     });
    //   if (callsTLFunction) {
    //     context.report({
    //       node,
    //       messageId: 'noUnnecessaryAct'
    //     });
    //   }
    // }

    return {
      [`${ACT_EXPRESSION_QUERY} > ArrowFunctionExpression`]: reportIfUnnecessary,
      [`${ACT_EXPRESSION_QUERY} > FunctionExpression`]: reportIfUnnecessary,
      [`${ACT_EXPRESSION_QUERY} > ArrowFunctionExpression > CallExpression > MemberExpression`]: reportTLNode,
      [`${ACT_EXPRESSION_QUERY} > FunctionExpression > CallExpression > MemberExpression`]: reportTLNode
      // [`${ACT_EXPRESSION_QUERY} > ArrowFunctionExpression > BlockStatement`]: reportTLNodeBlockStatement,
      // [`${ACT_EXPRESSION_QUERY} > FunctionExpression > BlockStatement`]: reportTLNodeBlockStatement
    };
  }
});
