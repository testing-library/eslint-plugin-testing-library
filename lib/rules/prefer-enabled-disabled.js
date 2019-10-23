/**
 * @fileoverview prefer toBeDisabled or toBeEnabled over attribute checks
 * @author Ben Monro
 */
'use strict';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description:
        'prefer toBeDisabled or toBeEnabled over checking properties',
      category: 'jest-dom',
      recommended: false,
    },
    fixable: 'code', // or "code" or "whitespace"
    schema: [
      // fill in your schema
    ],
  },

  create: function(context) {
    // variables should be defined here

    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------

    // any helper functions should go here or else delete this section

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return {
      "CallExpression[callee.object.callee.name='expect'][callee.property.name=toHaveProperty]"(
        node
      ) {
        if (node.arguments[0].value === 'disabled') {
          const correctFunction =
            node.arguments[1].value === true
              ? 'toBeDisabled()'
              : 'toBeEnabled()';
          context.report({
            node: node.callee.property,
            message: `Use ${correctFunction} instead of toHaveProperty('disabled', ${node.arguments[1].value})`,
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
