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
    const ranges = [];

    const reportWait = node => {
      if (!ranges.some(range => range === node.range)) {
        return;
      }

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
      if (!ranges.some(range => range === node.range)) {
        return;
      }

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
      'ImportDeclaration[source.value=/@testing-library/] > ImportSpecifier[imported.name=/^wait$|^waitForDomChange$|^waitForElement$/]'(
        node
      ) {
        // import declaration has been renamed
        if (
          node.local.range[0] !== node.imported.range[0] &&
          node.local.range[1] !== node.imported.range[1]
        ) {
          return;
        }

        context.report({
          node: node,
          message: 'rename wait import',
          // replace node if another import was already renamed
          // should we also test if `waitFor` was already imported?
          fix: fixer =>
            ranges.length
              ? fixer.remove(node)
              : fixer.replaceText(node, 'waitFor'),
        });

        // idea here was to iterate over all waits, but somehow the parent
        // of the node is undefined so it wasn't possible to check if the
        // wait method had arguments or not ...
        const [{ references }] = context.getDeclaredVariables(node);
        ranges.concat(references.map(({ identifier }) => identifier.range));
      },
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
