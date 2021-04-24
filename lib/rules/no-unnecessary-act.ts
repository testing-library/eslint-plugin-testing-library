import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  getDeepestIdentifierNode,
  getPropertyIdentifierNode,
  isCallExpression,
  isExpressionStatement,
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
    function hasNonTestingLibraryCall(
      statements: TSESTree.Statement[]
    ): boolean {
      for (const statement of statements) {
        if (!isExpressionStatement(statement)) {
          continue;
        }

        if (!isCallExpression(statement.expression)) {
          continue;
        }

        const identifier = getDeepestIdentifierNode(statement.expression);

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

    function checkNoUnnecessaryAct(
      blockStatementNode: TSESTree.BlockStatement
    ) {
      const callExpressionNode = blockStatementNode?.parent?.parent as
        | TSESTree.CallExpression
        | undefined;

      if (!callExpressionNode) {
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

      // TODO: check if empty function body

      if (hasNonTestingLibraryCall(blockStatementNode.body)) {
        return;
      }
    }

    return {
      'CallExpression > ArrowFunctionExpression > BlockStatement': checkNoUnnecessaryAct,
      'CallExpression > FunctionExpression > BlockStatement': checkNoUnnecessaryAct,
      // TODO: add selector for call expression > arrow function > implicit return
    };
  },
});
