'use strict';

const { getDocsUrl } = require('../utils');

const findCleanupSpecifier = specifiers => {
  return specifiers.find(specifier => specifier.imported.name === 'cleanup');
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: ' Disallow the use of `cleanup`',
      category: 'Best Practices',
      recommended: false,
      url: getDocsUrl('no-manual-cleanup'),
    },
    messages: {
      noManualCleanup:
        "`cleanup` is performed automatically after each test by {{library}}, you don't need manual cleanups.",
    },
    fixable: null,
    schema: [],
  },

  create: function(context) {
    return {
      ImportDeclaration(node) {
        const testingLibraryWithCleanup = node.source.value.match(
          /@testing-library\/(react|vue)/
        );

        // Early return if the library doesn't support `cleanup`
        if (!testingLibraryWithCleanup) {
          return;
        }

        const cleanupSpecifier = findCleanupSpecifier(node.specifiers);

        if (cleanupSpecifier) {
          context.report({
            node: cleanupSpecifier,
            messageId: 'noManualCleanup',
            data: {
              library: testingLibraryWithCleanup[0],
            },
          });
        }
      },
    };
  },
};
