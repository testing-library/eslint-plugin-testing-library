import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl } from '../utils';
import {
  isBlockStatement,
  isCallExpression,
  isIdentifier,
} from '../node-utils';

export const RULE_NAME = 'no-wait-for-empty-callback';
export type MessageIds = 'noWaitForEmptyCallback';
type Options = [];

const WAIT_EXPRESSION_QUERY =
  'CallExpression[callee.name=/^(waitFor|waitForElementToBeRemoved)$/]';

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "It's preferred to avoid empty callbacks in `waitFor` and `waitForElementToBeRemoved`",
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noWaitForEmptyCallback:
        'Avoid passing empty callback to `{{ methodName }}`. Insert an assertion instead.',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  // trimmed down implementation of https://github.com/eslint/eslint/blob/master/lib/rules/no-empty-function.js
  // TODO: var referencing any of previously mentioned?
  create: function(context) {
    function reportIfEmpty(
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression
    ) {
      if (
        isBlockStatement(node.body) &&
        node.body.body.length === 0 &&
        isCallExpression(node.parent) &&
        isIdentifier(node.parent.callee)
      ) {
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

    function reportNoop(node: TSESTree.Identifier) {
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
});
