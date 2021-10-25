import { TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import { isCallExpression } from '../node-utils';

export const RULE_NAME = 'no-dom-import';
export type MessageIds = 'noDomImport' | 'noDomImportFramework';
type Options = [string];

const DOM_TESTING_LIBRARY_MODULES = [
  'dom-testing-library',
  '@testing-library/dom',
];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow importing from DOM Testing Library',
      recommendedConfig: {
        dom: false,
        angular: ['error', 'angular'],
        react: ['error', 'react'],
        vue: ['error', 'vue'],
      },
    },
    messages: {
      noDomImport:
        'import from DOM Testing Library is restricted, import from corresponding Testing Library framework instead',
      noDomImportFramework:
        'import from DOM Testing Library is restricted, import from {{module}} instead',
    },
    fixable: 'code',
    schema: [
      {
        type: 'string',
      },
    ],
  },
  defaultOptions: [''],

  create(context, [framework], helpers) {
    function report(
      node: TSESTree.CallExpression | TSESTree.ImportDeclaration,
      moduleName: string
    ) {
      if (framework) {
        const correctModuleName = moduleName.replace('dom', framework);
        context.report({
          node,
          messageId: 'noDomImportFramework',
          data: {
            module: correctModuleName,
          },
          fix(fixer) {
            if (isCallExpression(node)) {
              const name = node.arguments[0] as TSESTree.Literal;

              // Replace the module name with the raw module name as we can't predict which punctuation the user is going to use
              return fixer.replaceText(
                name,
                name.raw.replace(moduleName, correctModuleName)
              );
            } else {
              const name = node.source;
              return fixer.replaceText(
                name,
                name.raw.replace(moduleName, correctModuleName)
              );
            }
          },
        });
      } else {
        context.report({
          node,
          messageId: 'noDomImport',
        });
      }
    }

    return {
      'Program:exit'() {
        const importName = helpers.getTestingLibraryImportName();
        const importNode = helpers.getTestingLibraryImportNode();

        if (!importNode) {
          return;
        }

        const domModuleName = DOM_TESTING_LIBRARY_MODULES.find(
          (module) => module === importName
        );

        if (!domModuleName) {
          return;
        }

        report(importNode, domModuleName);
      },
    };
  },
});
