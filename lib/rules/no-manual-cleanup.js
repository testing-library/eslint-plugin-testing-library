'use strict';

const CLEANUP_LIBRARY_REGEX = /(@testing-library\/(preact|react|svelte|vue))|@marko\/testing-library/;

module.exports = {
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

  create: function(context) {
    let defaultImportFromTestingLibrary;
    let defaultRequireFromTestingLibrary;

    return {
      ImportDeclaration(node) {
        const testingLibraryWithCleanup = node.source.value.match(
          CLEANUP_LIBRARY_REGEX
        );

        // Early return if the library doesn't support `cleanup`
        if (!testingLibraryWithCleanup) {
          return;
        }

        if (node.specifiers[0].type === 'ImportDefaultSpecifier') {
          defaultImportFromTestingLibrary = node;
        }

        const cleanupSpecifier = node.specifiers.find(
          specifier =>
            specifier.imported && specifier.imported.name === 'cleanup'
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
          node.init &&
          node.init.callee &&
          node.init.callee.name === 'require'
        ) {
          const requiredModule = node.init.arguments[0];
          const testingLibraryWithCleanup = requiredModule.value.match(
            CLEANUP_LIBRARY_REGEX
          );

          // Early return if the library doesn't support `cleanup`
          if (!testingLibraryWithCleanup) {
            return;
          }

          if (node.id.type === 'ObjectPattern') {
            const cleanupProperty = node.id.properties.find(
              property => property.key.name === 'cleanup'
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

          reportImportReferences(context, references);
        }

        if (defaultRequireFromTestingLibrary) {
          const references = context
            .getDeclaredVariables(defaultRequireFromTestingLibrary.parent)[0]
            .references.slice(1);

          reportImportReferences(context, references);
        }
      },
    };
  },
};

function reportImportReferences(context, references) {
  if (references && references.length > 0) {
    references.forEach(reference => {
      const utilsUsage = reference.identifier.parent;
      if (
        utilsUsage &&
        utilsUsage.property &&
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
