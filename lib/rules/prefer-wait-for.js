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

          return arg
            ? fixer.replaceText(node, 'waitFor')
            : fixer.replaceText(parent, 'waitFor(() => {})');
        },
      });
    };

    const reportWaitForDomChange = node => {
      context.report({
        node: node,
        messageId: 'preferWaitFor',
        data: {
          methodName: node.name,
        },
        fix: fixer => {
          const { parent } = node;
          const [arg] = parent.arguments;
          if (arg) {
            return [
              fixer.replaceText(node, 'waitFor'),
              fixer.insertTextBefore(arg, `() => {}, `),
            ];
          }
          return fixer.replaceText(parent, 'waitFor(() => {})');
        },
      });
    };

    return {
      'CallExpression > Identifier[name=wait]'(node) {
        reportWait(node);
      },
      'CallExpression > Identifier[name=waitForElement]'(node) {
        reportWait(node);
      },
      'CallExpression > Identifier[name=waitForDomChange]'(node) {
        reportWaitForDomChange(node);
      },
    };
  },
};
