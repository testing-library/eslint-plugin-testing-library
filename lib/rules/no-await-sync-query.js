'use strict';

const SYNC_QUERIES_REGEXP = /^(get|query)(All)?By(LabelText|PlaceholderText|Text|AltText|Title|DisplayValue|Role|TestId)$/;

const getError = nodeName => `\`${nodeName}\` does not need \`await\` operator`;

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary `await` for sync queries',
      category: 'Best Practices',
      recommended: true,
      url: 'TODO',
    },
    fixable: null,
    schema: [],
  },

  create: function(context) {
    return {
      [`AwaitExpression > CallExpression > Identifier[name=${SYNC_QUERIES_REGEXP}]`](
        node
      ) {
        context.report({
          node,
          message: getError(node.name),
        });
      },
    };
  },
};
