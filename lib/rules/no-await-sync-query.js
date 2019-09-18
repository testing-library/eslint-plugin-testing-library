'use strict';

const { getDocsUrl } = require('../utils');

const SYNC_QUERIES_REGEXP = /^(get|query)(All)?By(LabelText|PlaceholderText|Text|AltText|Title|DisplayValue|Role|TestId)$/;

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary `await` for sync queries',
      category: 'Best Practices',
      recommended: true,
      url: getDocsUrl('no-await-sync-query'),
    },
    messages: {
      noAwaitSyncQuery: '`{{ name }}` does not need `await` operator',
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
          messageId: 'noAwaitSyncQuery',
          data: {
            name: node.name,
          },
        });
      },
    };
  },
};
