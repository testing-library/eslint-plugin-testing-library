import {
  TSESTree,
  ASTUtils,
  TSESLintScope,
} from '@typescript-eslint/experimental-utils';
import {
  findClosestCallExpressionNode,
  getVariableReferences,
  hasClosestExpectResolvesRejects,
  isAwaited,
  isBlockStatement,
  isCallExpression,
  isPromiseResolved,
  isReturnStatement,
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
      description: 'Enforce async queries to have proper `await`',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      awaitAsyncQuery: 'promise returned from {{ name }} query must be handled',
      asyncQueryWrapper:
        'promise returned from {{ name }} wrapper must be handled',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    const functionWrappersNames: string[] = [];

    function getInnermostFunctionScope(
      asyncQueryNode: TSESTree.Identifier
    ): TSESLintScope.FunctionScope | null {
      const innermostScope = ASTUtils.getInnermostScope(
        context.getScope(),
        asyncQueryNode
      );

      if (innermostScope?.type === 'function') {
        return (innermostScope as unknown) as TSESLintScope.FunctionScope;
      }

      return null;
    }

    return {
      'CallExpression Identifier'(node: TSESTree.Identifier) {
        // check async query direct calls or related function wrapper
        if (helpers.isAsyncQuery(node)) {
          const functionScope = getInnermostFunctionScope(node);

          if (
            functionScope &&
            ASTUtils.isFunction(functionScope.block) &&
            isBlockStatement(functionScope.block.body)
          ) {
            // report function wrapper calls rather than async calls

            const returnStatementNode = functionScope.block.body.body.find(
              (statement) => isReturnStatement(statement)
            ) as TSESTree.ReturnStatement | null;

            if (
              returnStatementNode &&
              isCallExpression(returnStatementNode.argument)
            ) {
              // TODO: improve this check,
              //  assume for now the query is within the return statement
              functionWrappersNames.push(functionScope.block.id.name);
            }
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
        } else if (functionWrappersNames.includes(node.name)) {
          const closestCallExpressionNode = findClosestCallExpressionNode(
            node,
            true
          );

          // stop checking if Identifier doesn't belong to CallExpression
          if (!closestCallExpressionNode) {
            return;
          }

          if (isAwaited(closestCallExpressionNode.parent)) {
            return;
          }

          if (isPromiseResolved(node)) {
            return;
          }

          return context.report({
            node,
            messageId: 'asyncQueryWrapper',
            data: { name: node.name },
          });
        }
      },
    };
  },
});
