import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl } from '../utils';
import {
  isImportDefaultSpecifier,
  isLiteral,
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
      description: 'Disallow the use of `cleanup`',
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
        references.forEach((reference) => {
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
        const value = node.source.value as string;
        const testingLibraryWithCleanup = value.match(CLEANUP_LIBRARY_REGEX);

        // Early return if the library doesn't support `cleanup`
        if (!testingLibraryWithCleanup) {
          return;
        }

        if (isImportDefaultSpecifier(node.specifiers[0])) {
          defaultImportFromTestingLibrary = node;
        }

        const cleanupSpecifier = node.specifiers.find(
          (specifier) =>
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
      [`VariableDeclarator > CallExpression > Identifier[name="require"]`](
        node: TSESTree.Identifier
      ) {
        const { arguments: args } = node.parent as TSESTree.CallExpression;

        const literalNodeCleanupModuleName = args.find(
          (args) =>
            isLiteral(args) &&
            typeof args.value === 'string' &&
            args.value.match(CLEANUP_LIBRARY_REGEX)
        );

        if (!literalNodeCleanupModuleName) {
          return;
        }

        const declaratorNode = node.parent
          .parent as TSESTree.VariableDeclarator;

        if (isObjectPattern(declaratorNode.id)) {
          const cleanupProperty = declaratorNode.id.properties.find(
            (property) =>
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
          defaultRequireFromTestingLibrary = declaratorNode.id;
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
