import { TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  getDeepestIdentifierNode,
  getStatementCallExpression,
  isEmptyFunction,
} from '../node-utils';

export const RULE_NAME = 'no-unnecessary-act';
export type MessageIds =
  | 'noUnnecessaryActEmptyFunction'
  | 'noUnnecessaryActTestingLibraryUtil';
type Options = [{ isStrict: boolean }];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow wrapping Testing Library utils or empty callbacks in `act`',
      category: 'Possible Errors',
      recommendedConfig: {
        dom: false,
        angular: false,
        react: false,
        vue: false,
      },
    },
    messages: {
      noUnnecessaryActTestingLibraryUtil:
        'Avoid wrapping Testing Library util calls in `act`',
      noUnnecessaryActEmptyFunction: 'Avoid wrapping empty function in `act`',
    },
    schema: [
      {
        type: 'object',
        properties: {
          isStrict: { type: 'boolean' },
        },
      },
    ],
  },
  defaultOptions: [
    {
      isStrict: false,
    },
  ],

  create(context, [options], helpers) {
    function getStatementIdentifier(statement: TSESTree.Statement) {
      const callExpression = getStatementCallExpression(statement);

      if (!callExpression) {
        return null;
      }

      const identifier = getDeepestIdentifierNode(callExpression);

      if (!identifier) {
        return null;
      }

      return identifier;
    }

    /**
     * Determines whether some call is non Testing Library related for a given list of statements.
     */
    function hasSomeNonTestingLibraryCall(
      statements: TSESTree.Statement[]
    ): boolean {
      return statements.some((statement) => {
        const identifier = getStatementIdentifier(statement);

        if (!identifier) {
          return false;
        }

        return !helpers.isTestingLibraryUtil(identifier);
      });
    }

    function hasTestingLibraryCall(statements: TSESTree.Statement[]) {
      return statements.some((statement) => {
        const identifier = getStatementIdentifier(statement);

        if (!identifier) {
          return false;
        }

        return helpers.isTestingLibraryUtil(identifier);
      });
    }

    function checkNoUnnecessaryActFromBlockStatement(
      blockStatementNode: TSESTree.BlockStatement
    ) {
      const { isStrict } = options;
      const functionNode = blockStatementNode.parent as
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionExpression
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
        return;
      }

      const shouldBeReported = isStrict
        ? hasSomeNonTestingLibraryCall(blockStatementNode.body) &&
          hasTestingLibraryCall(blockStatementNode.body)
        : !hasSomeNonTestingLibraryCall(blockStatementNode.body);

      if (shouldBeReported) {
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

      const parentCallExpression = node.parent?.parent as
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
      'CallExpression > ArrowFunctionExpression > BlockStatement':
        checkNoUnnecessaryActFromBlockStatement,
      'CallExpression > FunctionExpression > BlockStatement':
        checkNoUnnecessaryActFromBlockStatement,
      'CallExpression > ArrowFunctionExpression > CallExpression':
        checkNoUnnecessaryActFromImplicitReturn,
    };
  },
});
