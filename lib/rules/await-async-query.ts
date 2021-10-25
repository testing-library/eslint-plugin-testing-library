import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  findClosestCallExpressionNode,
  getDeepestIdentifierNode,
  getFunctionName,
  getInnermostReturningFunction,
  getVariableReferences,
  isPromiseHandled,
} from '../node-utils';

export const RULE_NAME = 'await-async-query';
export type MessageIds = 'asyncQueryWrapper' | 'awaitAsyncQuery';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce promises from async queries to be handled',
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
          // const element = await findByRole('button')
          if (references.length === 0) {
            if (!isPromiseHandled(identifierNode)) {
              context.report({
                node: identifierNode,
                messageId: 'awaitAsyncQuery',
                data: { name: identifierNode.name },
              });
              return;
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
              context.report({
                node: identifierNode,
                messageId: 'awaitAsyncQuery',
                data: { name: identifierNode.name },
              });
              return;
            }
          }
        } else if (
          functionWrappersNames.includes(identifierNode.name) &&
          !isPromiseHandled(identifierNode)
        ) {
          // check async queries used within a wrapper previously detected
          context.report({
            node: identifierNode,
            messageId: 'asyncQueryWrapper',
            data: { name: identifierNode.name },
          });
        }
      },
    };
  },
});
