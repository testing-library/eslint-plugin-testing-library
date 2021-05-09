import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import {
  findClosestCallExpressionNode,
  getDeepestIdentifierNode,
  getFunctionName,
  getInnermostReturningFunction,
  getVariableReferences,
  isPromiseHandled,
} from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'await-async-query';
export type MessageIds = 'awaitAsyncQuery' | 'asyncQueryWrapper';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce promises from async queries to be handled',
      category: 'Best Practices',
      recommendedConfig: {
        dom: 'error',
        angular: 'error',
        react: 'error',
        vue: 'error',
      },
    },
    messages: {
      awaitAsyncQuery:
        'promise returned from `{{ name }}` query must be handled',
      asyncQueryWrapper:
        'promise returned from `{{ name }}` wrapper over async query must be handled',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    const functionWrappersNames: string[] = [];

    function detectAsyncQueryWrapper(node: TSESTree.Identifier) {
      const innerFunction = getInnermostReturningFunction(context, node);
      if (innerFunction) {
        functionWrappersNames.push(getFunctionName(innerFunction));
      }
    }

    return {
      CallExpression(node) {
        const identifierNode = getDeepestIdentifierNode(node);

        if (!identifierNode) {
          return;
        }

        if (helpers.isAsyncQuery(identifierNode)) {
          // detect async query used within wrapper function for later analysis
          detectAsyncQueryWrapper(identifierNode);

          const closestCallExpressionNode = findClosestCallExpressionNode(
            node,
            true
          );

          if (!closestCallExpressionNode || !closestCallExpressionNode.parent) {
            return;
          }

          const references = getVariableReferences(
            context,
            closestCallExpressionNode.parent
          );

          // check direct usage of async query:
          //  const element = await findByRole('button')
          if (references && references.length === 0) {
            if (!isPromiseHandled(identifierNode)) {
              return context.report({
                node: identifierNode,
                messageId: 'awaitAsyncQuery',
                data: { name: identifierNode.name },
              });
            }
          }

          // check references usages of async query:
          //  const promise = findByRole('button')
          //  const element = await promise
          for (const reference of references) {
            if (
              ASTUtils.isIdentifier(reference.identifier) &&
              !isPromiseHandled(reference.identifier)
            ) {
              return context.report({
                node: identifierNode,
                messageId: 'awaitAsyncQuery',
                data: { name: identifierNode.name },
              });
            }
          }
        } else if (functionWrappersNames.includes(identifierNode.name)) {
          // check async queries used within a wrapper previously detected
          if (!isPromiseHandled(identifierNode)) {
            return context.report({
              node: identifierNode,
              messageId: 'asyncQueryWrapper',
              data: { name: identifierNode.name },
            });
          }
        }
      },
    };
  },
});
