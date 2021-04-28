import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  getDeepestIdentifierNode,
  getPropertyIdentifierNode,
  getStatementCallExpression,
  isEmptyFunction,
} from '../node-utils';

export const RULE_NAME = 'no-unnecessary-act';
export type MessageIds =
  | 'noUnnecessaryActTestingLibraryUtil'
  | 'noUnnecessaryActEmptyFunction';

export default createTestingLibraryRule<[], MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow the use of `act` when wrapping Testing Library utils or empty functions',
      category: 'Possible Errors',
      recommended: false,
    },
    messages: {
      noUnnecessaryActTestingLibraryUtil:
        'Avoid wrapping Testing Library util calls in `act`',
      noUnnecessaryActEmptyFunction: 'Avoid wrapping empty function in `act`',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    /**
     * Determines whether a given list of statements has some call non-related to Testing Library utils.
     */
    function hasNonTestingLibraryCall(
      statements: TSESTree.Statement[]
    ): boolean {
      // TODO: refactor to use Array.every
      for (const statement of statements) {
        const callExpression = getStatementCallExpression(statement);

        if (!callExpression) {
          continue;
        }

        const identifier = getDeepestIdentifierNode(callExpression);

        if (!identifier) {
          continue;
        }

        if (helpers.isTestingLibraryUtil(identifier)) {
          continue;
        }

        // at this point the statement is a non testing library call
        return true;
      }
      return false;
    }

    function checkNoUnnecessaryActFromBlockStatement(
      blockStatementNode: TSESTree.BlockStatement
    ) {
      const functionNode = blockStatementNode?.parent as
        | TSESTree.FunctionExpression
        | TSESTree.ArrowFunctionExpression
        | undefined;
      const callExpressionNode = functionNode?.parent as
        | TSESTree.CallExpression
        | undefined;

      if (!callExpressionNode || !functionNode) {
        return;
      }

      const callExpressionIdentifier = getPropertyIdentifierNode(
        callExpressionNode
      );

      if (!callExpressionIdentifier) {
        return;
      }

      if (!helpers.isActUtil(callExpressionIdentifier)) {
        return;
      }

      if (isEmptyFunction(functionNode)) {
        context.report({
          node: callExpressionIdentifier,
          messageId: 'noUnnecessaryActEmptyFunction',
        });

        return;
      }

      if (hasNonTestingLibraryCall(blockStatementNode.body)) {
        return;
      }

      context.report({
        node: callExpressionIdentifier,
        messageId: 'noUnnecessaryActTestingLibraryUtil',
      });
    }

    function checkNoUnnecessaryActFromImplicitReturn(
      node: TSESTree.CallExpression
    ) {
      const nodeIdentifier = getDeepestIdentifierNode(node);

      if (!nodeIdentifier) {
        return;
      }

      const parentCallExpression = node?.parent?.parent as
        | TSESTree.CallExpression
        | undefined;

      if (!parentCallExpression) {
        return;
      }

      const parentCallExpressionIdentifier = getPropertyIdentifierNode(
        parentCallExpression
      );

      if (!parentCallExpressionIdentifier) {
        return;
      }

      if (!helpers.isActUtil(parentCallExpressionIdentifier)) {
        return;
      }

      if (!helpers.isTestingLibraryUtil(nodeIdentifier)) {
        return;
      }

      context.report({
        node: parentCallExpressionIdentifier,
        messageId: 'noUnnecessaryActTestingLibraryUtil',
      });
    }

    return {
      'CallExpression > ArrowFunctionExpression > BlockStatement': checkNoUnnecessaryActFromBlockStatement,
      'CallExpression > FunctionExpression > BlockStatement': checkNoUnnecessaryActFromBlockStatement,
      'CallExpression > ArrowFunctionExpression > CallExpression': checkNoUnnecessaryActFromImplicitReturn,
    };
  },
});
