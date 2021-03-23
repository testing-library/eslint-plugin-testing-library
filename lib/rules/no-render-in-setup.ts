import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { TESTING_FRAMEWORK_SETUP_HOOKS } from '../utils';
import { getDeepestIdentifierNode, isCallExpression } from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'no-render-in-setup';
export type MessageIds = 'noRenderInSetup';
type Options = [
  {
    allowTestingFrameworkSetupHook?: string;
  }
];

export function findClosestBeforeHook(
  node: TSESTree.Node,
  testingFrameworkSetupHooksToFilter: string[]
): TSESTree.Identifier | null {
  if (node === null) {
    return null;
  }

  if (
    isCallExpression(node) &&
    ASTUtils.isIdentifier(node.callee) &&
    testingFrameworkSetupHooksToFilter.includes(node.callee.name)
  ) {
    return node.callee;
  }

  return findClosestBeforeHook(node.parent, testingFrameworkSetupHooksToFilter);
}

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow the use of `render` in testing frameworks setup functions',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noRenderInSetup:
        'Forbidden usage of `render` within testing framework `{{ name }}` setup',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        default: {},
        properties: {
          allowTestingFrameworkSetupHook: {
            enum: TESTING_FRAMEWORK_SETUP_HOOKS,
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowTestingFrameworkSetupHook: '',
    },
  ],

  create(context, [{ allowTestingFrameworkSetupHook }], helpers) {
    return {
      CallExpression(node) {
        let testingFrameworkSetupHooksToFilter = TESTING_FRAMEWORK_SETUP_HOOKS;
        if (allowTestingFrameworkSetupHook.length !== 0) {
          testingFrameworkSetupHooksToFilter = TESTING_FRAMEWORK_SETUP_HOOKS.filter(
            (hook) => hook !== allowTestingFrameworkSetupHook
          );
        }
        const callExpressionIdentifier = getDeepestIdentifierNode(node);

        if (!helpers.isRenderUtil(callExpressionIdentifier)) {
          return;
        }

        const beforeHook = findClosestBeforeHook(
          node,
          testingFrameworkSetupHooksToFilter
        );

        if (!beforeHook) {
          return;
        }

        context.report({
          node,
          messageId: 'noRenderInSetup',
          data: {
            name: beforeHook.name,
          },
        });
      },
    };
  },
});
