import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';
import { ASYNC_UTILS } from '../utils';
import {
  findClosestCallExpressionNode,
  isMemberExpression,
} from '../node-utils';

export const RULE_NAME = 'no-wait-for-snapshot';
export type MessageIds = 'noWaitForSnapshot';
type Options = [];

const SNAPSHOT_REGEXP = /^(toMatchSnapshot|toMatchInlineSnapshot)$/;

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensures no snapshot is generated inside of a `waitFor` call',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      noWaitForSnapshot:
        "A snapshot can't be generated inside of a `{{ name }}` call",
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    function getClosestAsyncUtil(node: TSESTree.Node) {
      let n = node;
      do {
        const callExpression = findClosestCallExpressionNode(n);
        if (
          ASTUtils.isIdentifier(callExpression.callee) &&
          helpers.isNodeComingFromTestingLibrary(callExpression.callee) &&
          ASYNC_UTILS.includes(callExpression.callee.name)
        ) {
          return callExpression.callee;
        }
        if (
          isMemberExpression(callExpression.callee) &&
          ASTUtils.isIdentifier(callExpression.callee.property) &&
          helpers.isNodeComingFromTestingLibrary(callExpression.callee)
        ) {
          return callExpression.callee.property;
        }
        n = findClosestCallExpressionNode(callExpression.parent);
      } while (n !== null);
      return null;
    }

    return {
      [`Identifier[name=${SNAPSHOT_REGEXP}]`](node: TSESTree.Identifier) {
        const closestAsyncUtil = getClosestAsyncUtil(node);
        if (closestAsyncUtil === null) {
          return;
        }
        context.report({
          node,
          messageId: 'noWaitForSnapshot',
          data: { name: closestAsyncUtil.name },
        });
      },
    };
  },
});
