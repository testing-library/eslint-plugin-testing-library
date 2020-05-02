import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl } from '../utils';
import {
  isLiteral,
  isImportDefaultSpecifier,
  isCallExpression,
  isIdentifier,
  isObjectPattern,
  isProperty,
  isMemberExpression,
  isImportSpecifier,
} from '../node-utils';

export const RULE_NAME = 'no-manual-cleanup';
export type MessageIds = 'noManualCleanup';
type Options = [];

const CLEANUP_LIBRARY_REGEX = /(@testing-library\/(preact|react|svelte|vue))|@marko\/testing-library/;

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: ' Disallow the use of `cleanup`',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noManualCleanup:
        "`cleanup` is performed automatically by your test runner, you don't need manual cleanups.",
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    let defaultImportFromTestingLibrary: TSESTree.ImportDeclaration;
    let defaultRequireFromTestingLibrary:
      | TSESTree.Identifier
      | TSESTree.ArrayPattern;

    // can't find the right type?
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function reportImportReferences(references: any[]) {
      if (references && references.length > 0) {
        references.forEach(reference => {
          const utilsUsage = reference.identifier.parent;
          if (
            isMemberExpression(utilsUsage) &&
            isIdentifier(utilsUsage.property) &&
            utilsUsage.property.name === 'cleanup'
          ) {
            context.report({
              node: utilsUsage.property,
              messageId: 'noManualCleanup',
            });
          }
        });
      }
    }

    return {
      ImportDeclaration(node) {
        if (!isLiteral(node.source) || typeof node.source.value !== 'string') {
          return;
        }

        const testingLibraryWithCleanup = node.source.value.match(
          CLEANUP_LIBRARY_REGEX
        );

        // Early return if the library doesn't support `cleanup`
        if (!testingLibraryWithCleanup) {
          return;
        }

        if (isImportDefaultSpecifier(node.specifiers[0])) {
          defaultImportFromTestingLibrary = node;
        }

        const cleanupSpecifier = node.specifiers.find(
          specifier =>
            isImportSpecifier(specifier) &&
            specifier.imported &&
            specifier.imported.name === 'cleanup'
        );

        if (cleanupSpecifier) {
          context.report({
            node: cleanupSpecifier,
            messageId: 'noManualCleanup',
          });
        }
      },
      VariableDeclarator(node) {
        if (
          isCallExpression(node.init) &&
          isIdentifier(node.init.callee) &&
          node.init.callee.name === 'require'
        ) {
          const [requiredModule] = node.init.arguments;
          if (
            !isLiteral(requiredModule) ||
            typeof requiredModule.value !== 'string'
          ) {
            return;
          }
          const testingLibraryWithCleanup = requiredModule.value.match(
            CLEANUP_LIBRARY_REGEX
          );

          // Early return if the library doesn't support `cleanup`
          if (!testingLibraryWithCleanup) {
            return;
          }

          if (isObjectPattern(node.id)) {
            const cleanupProperty = node.id.properties.find(
              property =>
                isProperty(property) &&
                isIdentifier(property.key) &&
                property.key.name === 'cleanup'
            );
            if (cleanupProperty) {
              context.report({
                node: cleanupProperty,
                messageId: 'noManualCleanup',
              });
            }
          } else {
            defaultRequireFromTestingLibrary = node.id;
          }
        }
      },
      'Program:exit'() {
        if (defaultImportFromTestingLibrary) {
          const references = context.getDeclaredVariables(
            defaultImportFromTestingLibrary
          )[0].references;

          reportImportReferences(references);
        }

        if (defaultRequireFromTestingLibrary) {
          const references = context
            .getDeclaredVariables(defaultRequireFromTestingLibrary.parent)[0]
            .references.slice(1);

          reportImportReferences(references);
        }
      },
    };
  },
});
