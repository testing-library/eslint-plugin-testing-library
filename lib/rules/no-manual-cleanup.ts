import {
  AST_NODE_TYPES,
  ASTUtils,
  TSESTree,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
import {
  getVariableReferences,
  isImportDefaultSpecifier,
  isImportSpecifier,
  isMemberExpression,
  isObjectPattern,
  isProperty,
} from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'no-manual-cleanup';
export type MessageIds = 'noManualCleanup';
type Options = [];

const CLEANUP_LIBRARY_REGEXP = /(@testing-library\/(preact|react|svelte|vue))|@marko\/testing-library/;

export default createTestingLibraryRule<Options, MessageIds>({
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

  create(context, _, helpers) {
    // can't find the right type?
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function reportImportReferences(references: TSESLint.Scope.Reference[]) {
      references.forEach((reference) => {
        const utilsUsage = reference.identifier.parent;
        if (
          isMemberExpression(utilsUsage) &&
          ASTUtils.isIdentifier(utilsUsage.property) &&
          utilsUsage.property.name === 'cleanup'
        ) {
          context.report({
            node: utilsUsage.property,
            messageId: 'noManualCleanup',
          });
        }
      });
    }

    return {
      'Program:exit'() {
        const moduleName = helpers.getTestingLibraryImportName();
        const moduleNode = helpers.getTestingLibraryImportNode();

        if (!moduleNode) {
          return;
        }

        // Early return if the library doesn't support `cleanup`
        if (!moduleName.match(CLEANUP_LIBRARY_REGEXP)) {
          return;
        }

        if (moduleNode.type === AST_NODE_TYPES.ImportDeclaration) {
          // case: import utils from 'testing-library-module'
          if (isImportDefaultSpecifier(moduleNode.specifiers[0])) {
            const { references } = context.getDeclaredVariables(moduleNode)[0];

            reportImportReferences(references);
          }

          // case: import { cleanup } from 'testing-library-module'
          const cleanupSpecifier = moduleNode.specifiers.find(
            (specifier) =>
              isImportSpecifier(specifier) &&
              specifier.imported.name === 'cleanup'
          );

          if (cleanupSpecifier) {
            context.report({
              node: cleanupSpecifier,
              messageId: 'noManualCleanup',
            });
          }
        } else {
          const declaratorNode = moduleNode.parent as TSESTree.VariableDeclarator;

          if (isObjectPattern(declaratorNode.id)) {
            // case: const { cleanup } = require('testing-library-module')
            const cleanupProperty = declaratorNode.id.properties.find(
              (property) =>
                isProperty(property) &&
                ASTUtils.isIdentifier(property.key) &&
                property.key.name === 'cleanup'
            );

            if (cleanupProperty) {
              context.report({
                node: cleanupProperty,
                messageId: 'noManualCleanup',
              });
            }
          } else {
            // case: const utils = require('testing-library-module')
            const references = getVariableReferences(context, declaratorNode);
            reportImportReferences(references);
          }
        }
      },
    };
  },
});
