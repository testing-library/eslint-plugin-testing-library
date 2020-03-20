'use strict';

const WAIT_EXPRESSION_QUERY =
  'CallExpression[callee.name=/^(waitFor|waitForElementToBeRemoved)$/]';

module.exports = {
  meta: {
    type: 'code',
    docs: {
      description: '',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noWaitForEmptyCallback: '',
    },
    fixable: null,
    schema: [],
  },

  // trimmed down implementation of https://github.com/eslint/eslint/blob/master/lib/rules/no-empty-function.js
  create: function(context) {
    const sourceCode = context.getSourceCode();

    function reportIfEmpty(node) {
      const innerComments = sourceCode.getTokens(node.body, {
        includeComments: true,
        filter: isCommentToken,
      });

      if (
        node.body.type === 'BlockStatement' &&
        node.body.body.length === 0 &&
        innerComments.length === 0
      ) {
        context.report({
          node,
          loc: node.body.loc.start,
          messageId: 'noWaitForEmptyCallback',
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

function isCommentToken(token) {
  return (
    token.type === 'Line' || token.type === 'Block' || token.type === 'Shebang'
  );
}
