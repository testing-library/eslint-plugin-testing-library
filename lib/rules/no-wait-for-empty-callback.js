'use strict';

const { getDocsUrl } = require('../utils');

const WAIT_EXPRESSION_QUERY =
  'CallExpression[callee.name=/^(waitFor|waitForElementToBeRemoved)$/]';

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "It's preferred to avoid empty callbacks in `waitFor` and `waitForElementToBeRemoved`",
      category: 'Best Practices',
      recommended: false,
      url: getDocsUrl('no-wait-for-empty-callback'),
    },
    messages: {
      noWaitForEmptyCallback:
        'Avoid passing empty callback to `{{ methodName }}`. Insert an assertion instead.',
    },
    fixable: null,
    schema: [],
  },

  // trimmed down implementation of https://github.com/eslint/eslint/blob/master/lib/rules/no-empty-function.js
  // TODO: var referencing any of previously mentioned?
  create: function(context) {
    function reportIfEmpty(node) {
      if (node.body.type === 'BlockStatement' && node.body.body.length === 0) {
        context.report({
          node,
          loc: node.body.loc.start,
          messageId: 'noWaitForEmptyCallback',
          data: {
            methodName: node.parent.callee.name,
          },
        });
      }
    }

    function reportNoop(node) {
      context.report({
        node,
        loc: node.loc.start,
        messageId: 'noWaitForEmptyCallback',
      });
    }

    return {
      [`${WAIT_EXPRESSION_QUERY} > ArrowFunctionExpression`]: reportIfEmpty,
      [`${WAIT_EXPRESSION_QUERY} > FunctionExpression`]: reportIfEmpty,
      [`${WAIT_EXPRESSION_QUERY} > Identifier[name="noop"]`]: reportNoop,
    };
  },
};
