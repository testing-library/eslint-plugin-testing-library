'use strict';

const { getDocsUrl } = require('../utils');

const DEPRECATED_METHODS = ['wait', 'waitForElement', 'waitForDomChange'];

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Use `waitFor` instead of deprecated wait methods',
      category: 'Best Practices',
      recommended: false,
      url: getDocsUrl('prefer-wait-for'),
    },
    messages: {
      preferWaitForMethod:
        '`{{ methodName }}` is deprecated in favour of `waitFor`',
      preferWaitForImport: 'import `waitFor` instead of deprecated async utils',
    },
    fixable: 'code',
    schema: [],
  },

  create: function(context) {
    const importNodes = [];
    const waitNodes = [];

    const reportImport = node => {
      context.report({
        node: node,
        messageId: 'preferWaitForImport',
        fix(fixer) {
          const fixers = [];
          let waitForImported = false;

          node.specifiers.forEach((specifier, idx, specifiers) => {
            if (DEPRECATED_METHODS.includes(specifier.imported.name)) {
              if (waitForImported) {
                // after first deprecated method replaced,
                // we remove remaining ones to avoid duplicated `waitFor` imports
                // (this includes comma separating from next specifier)

                let rangeEnd = specifier.end;
                const nextSpecifier = specifiers[idx + 1];
                if (nextSpecifier) {
                  rangeEnd = nextSpecifier.start - 1;
                }
                fixers.push(
                  fixer.replaceTextRange([specifier.start, rangeEnd], '')
                );
              } else {
                // we replace first deprecated method we find with `waitFor`
                fixers.push(fixer.replaceText(specifier, 'waitFor'));
                waitForImported = true;
              }
            }
          });

          return fixers;
        },
      });
    };

    const reportWait = node => {
      context.report({
        node: node,
        messageId: 'preferWaitForMethod',
        data: {
          methodName: node.name,
        },
        fix(fixer) {
          const { parent } = node;
          const [arg] = parent.arguments;
          const fixers = [];

          if (arg) {
            // if method been fixed already had a callback
            // then we just replace the method name.
            fixers.push(fixer.replaceText(node, 'waitFor'));

            if (node.name === 'waitForDomChange') {
              // if method been fixed is `waitForDomChange`
              // then the arg received was options object so we need to insert
              // empty callback before.
              fixers.push(fixer.insertTextBefore(arg, `() => {}, `));
            }
          } else {
            // if wait method been fixed didn't have any callback
            // then we replace the method name and include an empty callback.
            fixers.push(fixer.replaceText(parent, 'waitFor(() => {})'));
          }

          return fixers;
        },
      });
    };

    return {
      'ImportDeclaration[source.value=/testing-library/]'(node) {
        const importedNames = node.specifiers
          .map(specifier => specifier.imported && specifier.imported.name)
          .filter(Boolean);

        if (
          importedNames.some(importedName =>
            DEPRECATED_METHODS.includes(importedName)
          )
        ) {
          importNodes.push(node);
        }
      },
      'CallExpression > Identifier[name=/^(wait|waitForElement|waitForDomChange)$/]'(
        node
      ) {
        waitNodes.push(node);
      },
      'Program:exit'() {
        waitNodes.forEach(waitNode => {
          reportWait(waitNode);
        });

        importNodes.forEach(importNode => {
          reportImport(importNode);
        });
      },
    };
  },
};
