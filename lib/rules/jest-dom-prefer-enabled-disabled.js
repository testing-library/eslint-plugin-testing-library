/**
 * @fileoverview prefer toBeDisabled or toBeEnabled over attribute checks
 * @author Ben Monro
 */
'use strict';

const { getDocsUrl } = require('../utils');

module.exports = {
  meta: {
    docs: {
      description:
        'prefer toBeDisabled or toBeEnabled over checking properties',
      category: 'jest-dom',
      recommended: true,
      url: getDocsUrl('jest-dom-prefer-enabled-disabled'),
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
      "CallExpression[callee.property.name=/toBeEnabled|toBeDisabled/][callee.object.property.name='not'][callee.object.object.callee.name='expect']"(
        node
      ) {
        const incorrectFunction = node.callee.property.name;

        const correctFunction =
          incorrectFunction === 'toBeDisabled' ? 'toBeEnabled' : 'toBeDisabled';
        context.report({
          message: `Use ${correctFunction}() instead of not.${incorrectFunction}()`,
          node,
          fix(fixer) {
            return fixer.replaceTextRange(
              [node.callee.object.property.start, node.end],
              `${correctFunction}()`
            );
          },
        });
      },
      "CallExpression[callee.property.name=/toHaveProperty|toHaveAttribute/][callee.object.property.name='not'][callee.object.object.callee.name='expect']"(
        node
      ) {
        const isDisabledArg = node.arguments[0].value === 'disabled';

        if (isDisabledArg) {
          const correctFunction = getCorrectFunctionFor(node, true);

          const incorrectFunction = node.callee.property.name;
          context.report({
            message: `Use ${correctFunction} instead of not.${incorrectFunction}('disabled')`,
            node,
            fix(fixer) {
              return fixer.replaceTextRange(
                [node.callee.object.property.start, node.end],
                correctFunction
              );
            },
          });
        }
      },
      "CallExpression[callee.object.callee.name='expect'][callee.property.name=/toHaveProperty|toHaveAttribute/]"(
        node
      ) {
        const isDisabledArg = node.arguments[0].value === 'disabled';

        if (isDisabledArg) {
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
