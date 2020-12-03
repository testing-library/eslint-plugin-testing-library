import { TSESTree } from '@typescript-eslint/experimental-utils';
import {
  findClosestCallExpressionNode,
  getVariableReferences,
  isMemberExpression,
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
    return {
      'CallExpression Identifier'(node: TSESTree.Identifier) {
        if (!helpers.isAsyncUtil(node)) {
          return;
        }

        if (
          !helpers.isNodeComingFromTestingLibrary(node) &&
          !(
            isMemberExpression(node.parent) &&
            helpers.isNodeComingFromTestingLibrary(node.parent)
          )
        ) {
          return;
        }

        const closestCallExpression = findClosestCallExpressionNode(node, true);

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
                name: node.name,
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
                  name: referenceNode.name,
                },
              });
            }
          }
        }
      },
    };
  },
});
