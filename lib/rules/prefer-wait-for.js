'use strict';

const { getDocsUrl } = require('../utils');

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
      preferWaitFor: '`{{ methodName }}` is deprecated in favour of `waitFor`',
    },
    fixable: 'code',
    schema: [],
  },

  create: function(context) {
    const importNodes = [];
    const waitNodes = [];

    const reportWait = node => {
      context.report({
        node: node,
        messageId: 'preferWaitFor',
        data: {
          methodName: node.name,
        },
        fix: fixer => {
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
        importNodes.push(node);
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
      },
    };
  },
};
