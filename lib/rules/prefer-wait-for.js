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

          node.specifiers.forEach(specifier => {
            if (DEPRECATED_METHODS.includes(specifier.imported.name)) {
              if (waitForImported) {
                fixers.push(fixer.remove(specifier));
              } else {
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
      'ImportDeclaration[source.value=/testing-library/] > ImportSpecifier[imported.name=/^(wait|waitForElement|waitForDomChange)$/]'(
        node
      ) {
        importNodes.push(node.parent);
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
