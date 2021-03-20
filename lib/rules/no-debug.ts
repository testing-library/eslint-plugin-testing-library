import { getDeepestIdentifierNode } from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'no-debug';
export type MessageIds = 'noDebug';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary debug usages in the tests',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      noDebug: 'Unexpected debug statement',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          renderFunctions: {
            type: 'array',
          },
        },
      },
    ],
  },
  defaultOptions: [],

  create(context, [], helpers) {
    return {
      VariableDeclarator(node) {
        const initIdentifierNode = getDeepestIdentifierNode(node.init);

        if (!initIdentifierNode) {
          return;
        }

        // TODO: check if named 'debug' and coming from render,
        //  and add it to suspicious list if so.
      },
      CallExpression(node) {
        const callExpressionIdentifier = getDeepestIdentifierNode(node);

        if (!helpers.isDebugUtil(callExpressionIdentifier)) {
          return;
        }

        context.report({
          node: callExpressionIdentifier,
          messageId: 'noDebug',
        });
      },
    };
  },
});
