import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  getDeepestIdentifierNode,
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

      const identifierNode = getDeepestIdentifierNode(callExpressionNode);
      if (!identifierNode) {
        return;
      }

      if (!helpers.isActUtil(identifierNode)) {
        return;
      }

      if (isEmptyFunction(functionNode)) {
        context.report({
          node: identifierNode,
          messageId: 'noUnnecessaryActEmptyFunction',
        });
      } else if (!hasSomeNonTestingLibraryCall(blockStatementNode.body)) {
        context.report({
          node: identifierNode,
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

      const identifierNode = getDeepestIdentifierNode(parentCallExpression);
      if (!identifierNode) {
        return;
      }

      if (!helpers.isActUtil(identifierNode)) {
        return;
      }

      if (!helpers.isTestingLibraryUtil(nodeIdentifier)) {
        return;
      }

      context.report({
        node: identifierNode,
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
