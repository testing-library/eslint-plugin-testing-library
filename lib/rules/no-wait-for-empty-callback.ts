import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  getPropertyIdentifierNode,
  isCallExpression,
  isEmptyFunction,
} from '../node-utils';

export const RULE_NAME = 'no-wait-for-empty-callback';
export type MessageIds = 'noWaitForEmptyCallback';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow empty callbacks for `waitFor` and `waitForElementToBeRemoved`',
      recommendedConfig: {
        dom: 'error',
        angular: 'error',
        react: 'error',
        vue: 'error',
      },
    },
    messages: {
      noWaitForEmptyCallback:
        'Avoid passing empty callback to `{{ methodName }}`. Insert an assertion instead.',
    },
    schema: [],
  },
  defaultOptions: [],

  // trimmed down implementation of https://github.com/eslint/eslint/blob/master/lib/rules/no-empty-function.js
  create(context, _, helpers) {
    function isValidWaitFor(node: TSESTree.Node): boolean {
      const parentCallExpression = node.parent as TSESTree.CallExpression;
      const parentIdentifier = getPropertyIdentifierNode(parentCallExpression);

      if (!parentIdentifier) {
        return false;
      }

      return helpers.isAsyncUtil(parentIdentifier, [
        'waitFor',
        'waitForElementToBeRemoved',
      ]);
    }

    function reportIfEmpty(
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression
    ) {
      if (!isValidWaitFor(node)) {
        return;
      }

      if (
        isEmptyFunction(node) &&
        isCallExpression(node.parent) &&
        ASTUtils.isIdentifier(node.parent.callee)
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
      if (!isValidWaitFor(node)) {
        return;
      }

      context.report({
        node,
        loc: node.loc.start,
        messageId: 'noWaitForEmptyCallback',
        data: {
          methodName:
            isCallExpression(node.parent) &&
            ASTUtils.isIdentifier(node.parent.callee) &&
            node.parent.callee.name,
        },
      });
    }

    return {
      'CallExpression > ArrowFunctionExpression': reportIfEmpty,
      'CallExpression > FunctionExpression': reportIfEmpty,
      'CallExpression > Identifier[name="noop"]': reportNoop,
    };
  },
});
