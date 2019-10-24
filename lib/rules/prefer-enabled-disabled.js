/**
 * @fileoverview prefer toBeDisabled or toBeEnabled over attribute checks
 * @author Ben Monro
 */
'use strict';

module.exports = {
  meta: {
    docs: {
      description:
        'prefer toBeDisabled or toBeEnabled over checking properties',
      category: 'jest-dom',
      recommended: false,
    },
    fixable: 'code',
  },

  create: function(context) {
    return {
      "CallExpression[callee.object.callee.name='expect'][callee.property.name=toHaveProperty], CallExpression[callee.object.callee.name='expect'][callee.property.name=toHaveAttribute]"(
        node
      ) {
        if (node.arguments[0].value === 'disabled') {
          const correctFunction =
            node.arguments.length === 1 || node.arguments[1].value === true
              ? 'toBeDisabled()'
              : 'toBeEnabled()';

          const incorrectFunction = node.callee.property.name;

          const message =
            node.arguments.length === 1
              ? `Use toBeDisabled() instead of ${incorrectFunction}('disabled')`
              : `Use ${correctFunction} instead of ${incorrectFunction}('disabled', ${node.arguments[1].value})`;
          context.report({
            node: node.callee.property,
            message,
            fix(fixer) {
              return [
                fixer.replaceTextRange(
                  [node.callee.property.start, node.end],
                  correctFunction
                ),
              ];
            },
          });
        }
      },
    };
  },
};
