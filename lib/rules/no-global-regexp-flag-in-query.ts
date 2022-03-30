import { ASTUtils, TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  isMemberExpression,
  isCallExpression,
  isProperty,
  isObjectExpression,
} from '../node-utils';

export const RULE_NAME = 'no-global-regexp-flag-in-query';
export type MessageIds = 'noGlobalRegExpFlagInQuery';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the use of the global RegExp flag (/g) in queries',
      recommendedConfig: {
        dom: false,
        angular: false,
        react: false,
        vue: false,
      },
    },
    messages: {
      noGlobalRegExpFlagInQuery:
        'Avoid using the global RegExp flag (/g) in queries',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context, _, helpers) {
    function lint(
      regexpNode: TSESTree.Literal,
      identifier: TSESTree.Identifier
    ) {
      if (helpers.isQuery(identifier)) {
        context.report({
          node: regexpNode,
          messageId: 'noGlobalRegExpFlagInQuery',
        });
      }
    }

    return {
      [`CallExpression[callee.type=MemberExpression] > Literal[regex.flags=/g/].arguments`](
        node: TSESTree.Literal
      ) {
        if (
          isCallExpression(node.parent) &&
          isMemberExpression(node.parent.callee) &&
          ASTUtils.isIdentifier(node.parent.callee.property)
        ) {
          lint(node, node.parent.callee.property);
        }
      },
      [`CallExpression[callee.type=Identifier] > Literal[regex.flags=/g/].arguments`](
        node: TSESTree.Literal
      ) {
        if (
          isCallExpression(node.parent) &&
          ASTUtils.isIdentifier(node.parent.callee)
        ) {
          lint(node, node.parent.callee);
        }
      },
      [`ObjectExpression:has(Property>[name="name"]) Literal[regex.flags=/g/]`](
        node: TSESTree.Literal
      ) {
        if (
          isProperty(node.parent) &&
          isObjectExpression(node.parent.parent) &&
          isCallExpression(node.parent.parent.parent) &&
          isMemberExpression(node.parent.parent.parent.callee) &&
          ASTUtils.isIdentifier(node.parent.parent.parent.callee.property)
        ) {
          lint(node, node.parent.parent.parent.callee.property);
        }
      },
    };
  },
});
