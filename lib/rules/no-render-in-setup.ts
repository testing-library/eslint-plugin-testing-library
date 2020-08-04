import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl, BEFORE_HOOKS } from '../utils';
import {
  isIdentifier,
  isCallExpression,
  isRenderFunction,
} from '../node-utils';

export const RULE_NAME = 'no-render-in-setup';
export type MessageIds = 'noRenderInSetup';

export function findClosestBeforeHook(
  node: TSESTree.Node
): TSESTree.Identifier | null {
  if (node === null) return null;
  if (
    isCallExpression(node) &&
    isIdentifier(node.callee) &&
    BEFORE_HOOKS.includes(node.callee.name)
  ) {
    return node.callee;
  }

  return findClosestBeforeHook(node.parent);
}

export default ESLintUtils.RuleCreator(getDocsUrl)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the use of `render` in setup functions',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noRenderInSetup:
        'Combine assertions into a single test instead of re-rendering the component.',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          renderFunctions: {
            type: 'array',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      renderFunctions: [],
    },
  ],

  create(context, [{ renderFunctions }]) {
    return {
      CallExpression(node) {
        const beforeHook = findClosestBeforeHook(node);
        if (isRenderFunction(node, renderFunctions) && beforeHook) {
          context.report({
            node,
            messageId: 'noRenderInSetup',
            data: {
              name: beforeHook.name,
            },
          });
        }
      },
    };
  },
});
