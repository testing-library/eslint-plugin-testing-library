'use strict';

const { getDocsUrl } = require('../utils');

const LIBRARY_MODULES_WITH_SCREEN = [
  '@testing-library/dom',
  '@testing-library/angular',
  '@testing-library/react',
  '@testing-library/preact',
  '@testing-library/vue',
  '@testing-library/svelte',
];

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary debug usages in the tests',
      category: 'Best Practices',
      recommended: true,
      url: getDocsUrl('no-debug'),
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

  create: function(context) {
    let hasDestructuredDebugStatement = false;
    const renderVariableDeclarators = [];

    let renderFunctions = [];
    if (context.options && context.options.length > 0) {
      [{ renderFunctions }] = context.options;
    }

    let hasImportedScreen = false;
    let wildcardImportName = null;

    return {
      VariableDeclarator(node) {
        if (isRenderVariableDeclarator(node, renderFunctions)) {
          if (
            node.id.type === 'ObjectPattern' &&
            node.id.properties.some(property => property.key.name === 'debug')
          ) {
            hasDestructuredDebugStatement = true;
          }

          if (node.id.type === 'Identifier') {
            renderVariableDeclarators.push(node);
          }
        }
      },
      [`VariableDeclarator > CallExpression > Identifier[name="require"]`](
        node
      ) {
        const { arguments: args } = node.parent;

        const literalNodeScreenModuleName = args.find(args =>
          LIBRARY_MODULES_WITH_SCREEN.includes(args.value)
        );

        if (!literalNodeScreenModuleName) {
          return;
        }

        const declaratorNode = node.parent.parent;

        if (
          declaratorNode.id.type === 'ObjectPattern' &&
          declaratorNode.id.properties.some(
            property => property.key.name === 'screen'
          )
        ) {
          hasImportedScreen = true;
        }
      },
      // checks if import has shape:
      // import { screen } from '@testing-library/dom';
      'ImportDeclaration ImportSpecifier'(node) {
        const importDeclarationNode = node.parent;

        if (!hasTestingLibraryImportModule(importDeclarationNode)) return;

        hasImportedScreen = node.imported.name === 'screen';
      },
      // checks if import has shape:
      // import * as dtl from '@testing-library/dom';
      'ImportDeclaration ImportNamespaceSpecifier'(node) {
        const importDeclarationNode = node.parent;
        if (!hasTestingLibraryImportModule(importDeclarationNode)) return;

        wildcardImportName = node.local && node.local.name;
      },
      [`CallExpression > Identifier[name="debug"]`](node) {
        if (hasDestructuredDebugStatement) {
          context.report({
            node,
            messageId: 'noDebug',
          });
        }
      },
      [`CallExpression > MemberExpression > Identifier[name="debug"]`](node) {
        /*
         check if `debug` used following the pattern:

            import { screen } from '@testing-library/dom';
            ...
            screen.debug();
        */
        const isScreenDebugUsed =
          hasImportedScreen &&
          node.parent &&
          node.parent.object.name === 'screen';

        /*
         check if `debug` used following the pattern:

            import * as dtl from '@testing-library/dom';
            ...
            dtl.debug();
        */
        const isNamespaceDebugUsed =
          wildcardImportName &&
          node.parent &&
          node.parent.object.name === wildcardImportName;

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
              parent &&
              parent.type === 'MemberExpression' &&
              parent.property.name === 'debug' &&
              parent.parent.type === 'CallExpression'
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
};

function isRenderFunction(callNode, renderFunctions) {
  return ['render', ...renderFunctions].some(
    name => callNode.callee && name === callNode.callee.name
  );
}

function isRenderVariableDeclarator(node, renderFunctions) {
  if (node.init) {
    if (node.init.type === 'AwaitExpression') {
      return (
        node.init.argument &&
        isRenderFunction(node.init.argument, renderFunctions)
      );
    } else {
      return node.init.callee && isRenderFunction(node.init, renderFunctions);
    }
  }

  return false;
}

function hasTestingLibraryImportModule(importDeclarationNode) {
  return LIBRARY_MODULES_WITH_SCREEN.some(
    module => module === importDeclarationNode.source.value
  );
}
