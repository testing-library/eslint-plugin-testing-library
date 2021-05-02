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
      recommendedConfig: {
        dom: false,
        angular: false,
        react: false, // this should be enabled on v5 of the plugin
        vue: false,
      },
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
     * Determines whether some call is non Testing Library related for a given list of statements.
     */
    function hasSomeNonTestingLibraryCall(
      statements: TSESTree.Statement[]
    ): boolean {
      return statements.some((statement) => {
        const callExpression = getStatementCallExpression(statement);

        if (!callExpression) {
          return false;
        }

        const identifier = getDeepestIdentifierNode(callExpression);

        if (!identifier) {
          return false;
        }

        return !helpers.isTestingLibraryUtil(identifier);
      });
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
      } else if (!hasSomeNonTestingLibraryCall(blockStatementNode.body)) {
        context.report({
          node: callExpressionIdentifier,
          messageId: 'noUnnecessaryActTestingLibraryUtil',
        });
      }
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
