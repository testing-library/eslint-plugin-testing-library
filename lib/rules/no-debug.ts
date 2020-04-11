import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl } from '../utils';
import {
  isObjectPattern,
  isProperty,
  isIdentifier,
  isCallExpression,
  isLiteral,
  isVariableDeclarator,
  isImportDeclaration,
  isAwaitExpression,
  isMemberExpression,
} from '../node-utils';

export const RULE_NAME = 'no-debug';

const LIBRARY_MODULES_WITH_SCREEN = [
  '@testing-library/dom',
  '@testing-library/angular',
  '@testing-library/react',
  '@testing-library/preact',
  '@testing-library/vue',
  '@testing-library/svelte',
];

function isRenderFunction(
  callNode: TSESTree.CallExpression,
  renderFunctions: string[]
) {
  return ['render', ...renderFunctions].some(
    name => isIdentifier(callNode.callee) && name === callNode.callee.name
  );
}

function isRenderVariableDeclarator(
  node: TSESTree.VariableDeclarator,
  renderFunctions: string[]
) {
  if (node.init) {
    if (isAwaitExpression(node.init)) {
      return (
        node.init.argument &&
        isRenderFunction(
          node.init.argument as TSESTree.CallExpression,
          renderFunctions
        )
      );
    } else {
      return (
        isCallExpression(node.init) &&
        isRenderFunction(node.init, renderFunctions)
      );
    }
  }

  return false;
}

function hasTestingLibraryImportModule(
  importDeclarationNode: TSESTree.ImportDeclaration
) {
  if (!isLiteral(importDeclarationNode.source)) {
    return;
  }
  const literal = importDeclarationNode.source;
  return LIBRARY_MODULES_WITH_SCREEN.some(module => module === literal.value);
}

export default ESLintUtils.RuleCreator(getDocsUrl)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary debug usages in the tests',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      noDebug: 'Unexpected debug statement',
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

  create(context, [options]) {
    let hasDestructuredDebugStatement = false;
    const renderVariableDeclarators: TSESTree.VariableDeclarator[] = [];

    const { renderFunctions } = options;

    let hasImportedScreen = false;
    let wildcardImportName: string = null;

    return {
      VariableDeclarator(node) {
        if (isRenderVariableDeclarator(node, renderFunctions)) {
          if (
            isObjectPattern(node.id) &&
            node.id.properties.some(
              property =>
                isProperty(property) &&
                isIdentifier(property.key) &&
                property.key.name === 'debug'
            )
          ) {
            hasDestructuredDebugStatement = true;
          }

          if (node.id.type === 'Identifier') {
            renderVariableDeclarators.push(node);
          }
        }
      },
      [`VariableDeclarator > CallExpression > Identifier[name="require"]`](
        node: TSESTree.Identifier
      ) {
        if (!isCallExpression(node.parent)) {
          return;
        }
        const { arguments: args } = node.parent;

        const literalNodeScreenModuleName = args.find(
          args =>
            isLiteral(args) &&
            typeof args.value === 'string' &&
            LIBRARY_MODULES_WITH_SCREEN.includes(args.value)
        );

        if (!literalNodeScreenModuleName) {
          return;
        }

        if (!isVariableDeclarator(node.parent.parent)) {
          return;
        }
        const declaratorNode = node.parent.parent;

        hasImportedScreen =
          isObjectPattern(declaratorNode.id) &&
          declaratorNode.id.properties.some(
            property =>
              isProperty(property) &&
              isIdentifier(property.key) &&
              property.key.name === 'screen'
          );
      },
      // checks if import has shape:
      // import { screen } from '@testing-library/dom';
      'ImportDeclaration ImportSpecifier'(node: TSESTree.ImportSpecifier) {
        if (!isImportDeclaration(node.parent)) {
          return;
        }
        const importDeclarationNode = node.parent;

        if (!hasTestingLibraryImportModule(importDeclarationNode)) return;

        hasImportedScreen = node.imported.name === 'screen';
      },
      // checks if import has shape:
      // import * as dtl from '@testing-library/dom';
      'ImportDeclaration ImportNamespaceSpecifier'(
        node: TSESTree.ImportNamespaceSpecifier
      ) {
        if (!isImportDeclaration(node.parent)) {
          return;
        }
        const importDeclarationNode = node.parent;
        if (!hasTestingLibraryImportModule(importDeclarationNode)) return;

        wildcardImportName = node.local && node.local.name;
      },
      [`CallExpression > Identifier[name="debug"]`](node: TSESTree.Identifier) {
        if (hasDestructuredDebugStatement) {
          context.report({
            node,
            messageId: 'noDebug',
          });
        }
      },
      [`CallExpression > MemberExpression > Identifier[name="debug"]`](
        node: TSESTree.Identifier
      ) {
        if (
          !isMemberExpression(node.parent) ||
          !isIdentifier(node.parent.object)
        ) {
          return;
        }

        const memberExpressionName = node.parent.object.name;
        /*
         check if `debug` used following the pattern:

            import { screen } from '@testing-library/dom';
            ...
            screen.debug();
        */
        const isScreenDebugUsed =
          hasImportedScreen && memberExpressionName === 'screen';

        /*
         check if `debug` used following the pattern:

            import * as dtl from '@testing-library/dom';
            ...
            dtl.debug();
        */
        const isNamespaceDebugUsed =
          wildcardImportName && memberExpressionName === wildcardImportName;

        if (isScreenDebugUsed || isNamespaceDebugUsed) {
          context.report({
            node,
            messageId: 'noDebug',
          });
        }
      },
      'Program:exit'() {
        renderVariableDeclarators.forEach(renderVar => {
          const renderVarReferences = context
            .getDeclaredVariables(renderVar)[0]
            .references.slice(1);
          renderVarReferences.forEach(ref => {
            const parent = ref.identifier.parent;
            if (
              isMemberExpression(parent) &&
              isIdentifier(parent.property) &&
              parent.property.name === 'debug' &&
              isCallExpression(parent.parent)
            ) {
              context.report({
                node: parent.property,
                messageId: 'noDebug',
              });
            }
          });
        });
      },
    };
  },
});
