import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl, LIBRARY_MODULES } from '../utils';
import {
  isObjectPattern,
  isProperty,
  isIdentifier,
  isCallExpression,
  isLiteral,
  isAwaitExpression,
  isMemberExpression,
  isImportSpecifier,
  isRenderFunction,
} from '../node-utils';

export const RULE_NAME = 'no-debug';

function isRenderVariableDeclarator(
  node: TSESTree.VariableDeclarator,
  renderFunctions: string[]
) {
  if (node.init) {
    if (isAwaitExpression(node.init)) {
      return (
        node.init.argument &&
        isRenderFunction(node.init.argument as TSESTree.CallExpression, [
          'render',
          ...renderFunctions,
        ])
      );
    } else {
      return (
        isCallExpression(node.init) &&
        isRenderFunction(node.init, ['render', ...renderFunctions])
      );
    }
  }

  return false;
}

function hasTestingLibraryImportModule(
  importDeclarationNode: TSESTree.ImportDeclaration
) {
  const literal = importDeclarationNode.source;
  return LIBRARY_MODULES.some(module => module === literal.value);
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
        const { arguments: args } = node.parent as TSESTree.CallExpression;

        const literalNodeScreenModuleName = args.find(
          args =>
            isLiteral(args) &&
            typeof args.value === 'string' &&
            LIBRARY_MODULES.includes(args.value)
        );

        if (!literalNodeScreenModuleName) {
          return;
        }

        const declaratorNode = node.parent
          .parent as TSESTree.VariableDeclarator;

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
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        if (!hasTestingLibraryImportModule(node)) return;
        hasImportedScreen = node.specifiers.some(
          s => isImportSpecifier(s) && s.imported.name === 'screen'
        );
      },
      // checks if import has shape:
      // import * as dtl from '@testing-library/dom';
      'ImportDeclaration ImportNamespaceSpecifier'(
        node: TSESTree.ImportNamespaceSpecifier
      ) {
        const importDeclarationNode = node.parent as TSESTree.ImportDeclaration;
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
        const memberExpression = node.parent as TSESTree.MemberExpression;
        const identifier = memberExpression.object as TSESTree.Identifier;
        const memberExpressionName = identifier.name;
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
