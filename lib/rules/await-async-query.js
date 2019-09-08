'use strict';

const VALID_PARENTS = [
  'AwaitExpression',
  'ArrowFunctionExpression',
  'ReturnStatement',
];

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce async queries (`findBy*`, `findAllBy*`) to have proper `await`',
      category: 'Best Practices',
      recommended: true,
      url: 'TODO',
    },
    fixable: null,
    schema: [],
  },

  create: function(context) {
    return {
      'CallExpression Identifier[name=/^find(All)?By(LabelText|PlaceholderText|Text|AltText|Title|DisplayValue|Role|TestId)$/]'(
        node
      ) {
        let hasError = true;
        try {
          if (VALID_PARENTS.includes(node.parent.parent.type)) {
            hasError = false;
          }
        } catch (e) {
          // not necessary to do anything
        }

        if (hasError) {
          context.report({
            node,
            message: `\`${node.name}\` must have \`await\` operator`,
          });
        }
      },
    };
  },
};
