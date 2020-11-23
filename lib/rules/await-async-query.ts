import { TSESTree } from '@typescript-eslint/experimental-utils';
import {
  findClosestCallExpressionNode,
  getVariableReferences,
  hasClosestExpectResolvesRejects,
  isAwaited,
  isPromiseResolved,
} from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'await-async-query';
export type MessageIds = 'awaitAsyncQuery';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce async queries to have proper `await`',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      awaitAsyncQuery: '`{{ name }}` must have `await` operator',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    return {
      'CallExpression Identifier'(node: TSESTree.Identifier) {
        // stop checking if not async query
        if (!helpers.isAsyncQuery(node)) {
          return;
        }

        const closestCallExpressionNode = findClosestCallExpressionNode(
          node,
          true
        );

        // stop checking if Identifier doesn't belong to CallExpression
        if (!closestCallExpressionNode) {
          return;
        }

        const references = getVariableReferences(
          context,
          closestCallExpressionNode.parent
        );

        if (references && references.length === 0) {
          // stop checking if already awaited
          if (isAwaited(closestCallExpressionNode.parent)) {
            return;
          }

          // stop checking if promise already handled
          if (isPromiseResolved(node)) {
            return;
          }

          // stop checking if belongs to async assert already handled
          if (hasClosestExpectResolvesRejects(closestCallExpressionNode)) {
            return;
          }

          return context.report({
            node,
            messageId: 'awaitAsyncQuery',
            data: { name: node.name },
          });
        }

        for (const reference of references) {
          const referenceNode = reference.identifier;

          if (isAwaited(referenceNode.parent)) {
            return;
          }

          if (isPromiseResolved(referenceNode)) {
            return;
          }

          return context.report({
            node,
            messageId: 'awaitAsyncQuery',
            data: { name: node.name },
          });
        }
      },
    };
  },
});
