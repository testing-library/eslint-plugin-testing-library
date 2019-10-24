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
    function getCorrectFunctionFor(node, negated = false) {
      return (node.arguments.length === 1 ||
        node.arguments[1].value === true) &&
        !negated
        ? 'toBeDisabled()'
        : 'toBeEnabled()';
    }
    return {
      "ExpressionStatement[expression.callee.property.name=/toHaveProperty|toHaveAttribute/][expression.callee.object.property.name='not'][expression.callee.object.object.callee.name='expect']"(
        node
      ) {
        const isDisabledArg = node.expression.arguments[0].value === 'disabled';

        if (isDisabledArg) {
          const correctFunction = getCorrectFunctionFor(node.expression, true);

          const incorrectFunction = node.expression.callee.property.name;
          context.report({
            message: `Use ${correctFunction} instead of not.${incorrectFunction}('disabled')`,
            node,
            fix(fixer) {
              return fixer.replaceTextRange(
                [node.expression.callee.object.property.start, node.end],
                'toBeEnabled()'
              );
            },
          });
        }
      },
      "CallExpression[callee.object.callee.name='expect'][callee.property.name=/toHaveProperty|toHaveAttribute/]"(
        node
      ) {
        if (node.arguments[0].value === 'disabled') {
          const correctFunction = getCorrectFunctionFor(node);

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
