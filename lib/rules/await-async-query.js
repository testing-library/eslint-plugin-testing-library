'use strict';

const VALID_PARENTS = [
  'AwaitExpression',
  'ArrowFunctionExpression',
  'ReturnStatement',
];

const ASYNC_QUERIES_REGEXP = /^find(All)?By(LabelText|PlaceholderText|Text|AltText|Title|DisplayValue|Role|TestId)$/;

const getError = nodeName => `\`${nodeName}\` must have \`await\` operator`;

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
      [`CallExpression > Identifier[name=${ASYNC_QUERIES_REGEXP}]`](node) {
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
            message: getError(node.name),
          });
        }
      },
    };
  },
};
