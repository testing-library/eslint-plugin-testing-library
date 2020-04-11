import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl } from '../utils';
import {
  isLiteral,
  isCallExpression,
  isIdentifier,
  isImportDeclaration,
} from '../node-utils';

export const RULE_NAME = 'no-dom-import';
export type MessageIds = 'noDomImport' | 'noDomImportFramework';
type Options = [string];

const DOM_TESTING_LIBRARY_MODULES = [
  'dom-testing-library',
  '@testing-library/dom',
];

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow importing from DOM Testing Library',
      category: 'Best Practices',
      recommended: false,
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

  create(context, [framework]) {
    function report(
      node: TSESTree.ImportDeclaration | TSESTree.Identifier,
      moduleName: string
    ) {
      if (framework) {
        const isRequire = isIdentifier(node) && node.name === 'require';
        const correctModuleName = moduleName.replace('dom', framework);
        context.report({
          node,
          messageId: 'noDomImportFramework',
          data: {
            module: correctModuleName,
          },
          fix(fixer) {
            if (isRequire) {
              if (!isCallExpression(node.parent)) {
                return;
              }

              const [name] = node.parent.arguments;
              if (!isLiteral(name)) {
                return;
              }

              // Replace the module name with the raw module name as we can't predict which punctuation the user is going to use
              return fixer.replaceText(
                name,
                name.raw.replace(moduleName, correctModuleName)
              );
            } else if (isImportDeclaration(node) && isLiteral(node.source)) {
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
      ImportDeclaration(node) {
        if (!isLiteral(node.source) || typeof node.source.value !== 'string') {
          return;
        }
        const value = node.source.value;
        const domModuleName = DOM_TESTING_LIBRARY_MODULES.find(
          module => module === value
        );

        if (domModuleName) {
          report(node, domModuleName);
        }
      },

      [`CallExpression > Identifier[name="require"]`](
        node: TSESTree.Identifier
      ) {
        if (!isCallExpression(node.parent)) {
          return;
        }
        const { arguments: args } = node.parent;

        const literalNodeDomModuleName = args.find(
          args =>
            isLiteral(args) &&
            typeof args.value === 'string' &&
            DOM_TESTING_LIBRARY_MODULES.includes(args.value)
        ) as TSESTree.Literal;

        if (literalNodeDomModuleName) {
          report(node, literalNodeDomModuleName.value as string);
        }
      },
    };
  },
});
