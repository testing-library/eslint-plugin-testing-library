import { TSESTree } from '@typescript-eslint/experimental-utils';
import {
  findClosestCallExpressionNode,
  getVariableReferences,
  isPromiseHandled,
} from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'await-async-utils';
export type MessageIds = 'awaitAsyncUtil';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce promises from async utils to be handled',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      awaitAsyncUtil: 'Promise returned from `{{ name }}` must be handled',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    const asyncUtilsUsage: Array<{
      node: TSESTree.Identifier | TSESTree.MemberExpression;
      name: string;
    }> = [];

    return {
      [`CallExpression > Identifier`](node: TSESTree.Identifier) {
        if (!helpers.isAsyncUtil(node)) {
          return;
        }

        asyncUtilsUsage.push({ node, name: node.name });
      },
      [`CallExpression > MemberExpression > Identifier`](
        node: TSESTree.Identifier
      ) {
        if (!helpers.isAsyncUtil(node)) {
          return;
        }

        const memberExpression = node.parent as TSESTree.MemberExpression;
        const identifier = memberExpression.object as TSESTree.Identifier;
        const memberExpressionName = identifier.name;

        asyncUtilsUsage.push({
          node: memberExpression,
          name: memberExpressionName,
        });
      },
      'Program:exit'() {
        const testingLibraryUtilUsage = asyncUtilsUsage.filter(({ node }) => {
          return helpers.isNodeComingFromTestingLibrary(node);
        });

        testingLibraryUtilUsage.forEach(({ node, name }) => {
          const closestCallExpression = findClosestCallExpressionNode(
            node,
            true
          );

          if (!closestCallExpression) {
            return;
          }

          const references = getVariableReferences(
            context,
            closestCallExpression.parent
          );

          if (references && references.length === 0) {
            if (!isPromiseHandled(node as TSESTree.Identifier)) {
              return context.report({
                node,
                messageId: 'awaitAsyncUtil',
                data: {
                  name,
                },
              });
            }
          } else {
            for (const reference of references) {
              const referenceNode = reference.identifier as TSESTree.Identifier;
              if (!isPromiseHandled(referenceNode)) {
                return context.report({
                  node,
                  messageId: 'awaitAsyncUtil',
                  data: {
                    name,
                  },
                });
              }
            }
          }
        });
      },
    };
  },
});
