import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl, TESTING_FRAMEWORK_SETUP_HOOKS } from '../utils';
import {
  isIdentifier,
  isCallExpression,
  isRenderFunction,
} from '../node-utils';

export const RULE_NAME = 'no-render-in-setup';
export type MessageIds = 'noRenderInSetup';

export function findClosestBeforeHook(
  node: TSESTree.Node,
  testingFrameworkSetupHooksToFilter: string[]
): TSESTree.Identifier | null {
  if (node === null) return null;
  if (
    isCallExpression(node) &&
    isIdentifier(node.callee) &&
    testingFrameworkSetupHooksToFilter.includes(node.callee.name)
  ) {
    return node.callee;
  }

  return findClosestBeforeHook(node.parent, testingFrameworkSetupHooksToFilter);
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
        'Move `render` out of `{{name}}` and into individual tests.',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          renderFunctions: {
            type: 'array',
          },
          allowTestingFrameworkSetupHook: {
            enum: TESTING_FRAMEWORK_SETUP_HOOKS,
          },
        },
        anyOf: [
          {
            required: ['renderFunctions'],
          },
          {
            required: ['allowTestingFrameworkSetupHook'],
          },
        ],
      },
    ],
  },
  defaultOptions: [
    {
      renderFunctions: [],
      allowTestingFrameworkSetupHook: '',
    },
  ],

  create(context, [{ renderFunctions, allowTestingFrameworkSetupHook }]) {
    return {
      CallExpression(node) {
        let testingFrameworkSetupHooksToFilter = TESTING_FRAMEWORK_SETUP_HOOKS;
        if (allowTestingFrameworkSetupHook.length !== 0) {
          testingFrameworkSetupHooksToFilter = TESTING_FRAMEWORK_SETUP_HOOKS.filter(
            hook => hook !== allowTestingFrameworkSetupHook
          );
        }
        const beforeHook = findClosestBeforeHook(
          node,
          testingFrameworkSetupHooksToFilter
        );
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
