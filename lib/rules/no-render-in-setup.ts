import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl, TESTING_FRAMEWORK_SETUP_HOOKS } from '../utils';
import {
  isLiteral,
  isProperty,
  isIdentifier,
  isObjectPattern,
  isCallExpression,
  isRenderFunction,
  isImportSpecifier,
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
    let renderImportedFromTestingLib = false;
    let wildcardImportName: string | null = null;

    return {
      // checks if import has shape:
      // import * as dtl from '@testing-library/dom';
      'ImportDeclaration[source.value=/testing-library/] ImportNamespaceSpecifier'(
        node: TSESTree.ImportNamespaceSpecifier
      ) {
        wildcardImportName = node.local && node.local.name;
      },
      // checks if `render` is imported from a '@testing-library/foo'
      'ImportDeclaration[source.value=/testing-library/]'(
        node: TSESTree.ImportDeclaration
      ) {
        renderImportedFromTestingLib = node.specifiers.some(specifier => {
          return (
            isImportSpecifier(specifier) && specifier.local.name === 'render'
          );
        });
      },
      [`VariableDeclarator > CallExpression > Identifier[name="require"]`](
        node: TSESTree.Identifier
      ) {
        const {
          arguments: callExpressionArgs,
        } = node.parent as TSESTree.CallExpression;
        const testingLibImport = callExpressionArgs.find(
          args =>
            isLiteral(args) &&
            typeof args.value === 'string' &&
            RegExp(/testing-library/, 'g').test(args.value)
        );
        if (!testingLibImport) {
          return;
        }
        const declaratorNode = node.parent
          .parent as TSESTree.VariableDeclarator;

        renderImportedFromTestingLib =
          isObjectPattern(declaratorNode.id) &&
          declaratorNode.id.properties.some(
            property =>
              isProperty(property) &&
              isIdentifier(property.key) &&
              property.key.name === 'render'
          );
      },
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

        // if `render` is imported from a @testing-library/foo or
        // imported with a wildcard, add `render` to the list of
        // disallowed render functions
        const disallowedRenderFns =
          renderImportedFromTestingLib || wildcardImportName
            ? ['render', ...renderFunctions]
            : renderFunctions;

        if (isRenderFunction(node, disallowedRenderFns) && beforeHook) {
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
