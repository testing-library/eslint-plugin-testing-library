import {
  getDeepestIdentifierNode,
  getPropertyIdentifierNode,
  getReferenceNode,
  isObjectPattern,
  isProperty,
} from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';
import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';

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
    const suspiciousDebugVariableNames: string[] = [];
    const suspiciousReferenceNodes: TSESTree.Identifier[] = [];

    return {
      VariableDeclarator(node) {
        const initIdentifierNode = getDeepestIdentifierNode(node.init);

        if (!helpers.isRenderUtil(initIdentifierNode)) {
          return;
        }

        // find debug obtained from render and save their name, like:
        // const { debug } = render();
        if (isObjectPattern(node.id)) {
          for (const property of node.id.properties) {
            if (
              isProperty(property) &&
              ASTUtils.isIdentifier(property.key) &&
              property.key.name === 'debug'
            ) {
              suspiciousDebugVariableNames.push(
                getDeepestIdentifierNode(property.value).name
              );
            }
          }
        }

        // find utils kept from render and save their node, like:
        // const utils = render();
        if (ASTUtils.isIdentifier(node.id)) {
          suspiciousReferenceNodes.push(node.id);
        }
      },
      CallExpression(node) {
        const callExpressionIdentifier = getDeepestIdentifierNode(node);
        const referenceNode = getReferenceNode(node);
        const referenceIdentifier = getPropertyIdentifierNode(referenceNode);

        const isDebugUtil = helpers.isDebugUtil(callExpressionIdentifier);
        const isDeclaredDebugVariable = suspiciousDebugVariableNames.includes(
          callExpressionIdentifier.name
        );
        const isChainedReferenceDebug = suspiciousReferenceNodes.some(
          (suspiciousReferenceIdentifier) => {
            return (
              callExpressionIdentifier.name === 'debug' &&
              suspiciousReferenceIdentifier.name === referenceIdentifier.name
            );
          }
        );

        if (isDebugUtil || isDeclaredDebugVariable || isChainedReferenceDebug) {
          context.report({
            node: callExpressionIdentifier,
            messageId: 'noDebug',
          });
        }
      },
    };
  },
});
