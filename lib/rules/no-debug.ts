import {
  getDeepestIdentifierNode,
  getFunctionName,
  getInnermostReturningFunction,
  getPropertyIdentifierNode,
  getReferenceNode,
  isObjectPattern,
  isProperty,
  isMemberExpression,
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
    schema: [],
  },
  defaultOptions: [],

  create(context, [], helpers) {
    const suspiciousDebugVariableNames: string[] = [];
    const suspiciousReferenceNodes: TSESTree.Identifier[] = [];
    const renderWrapperNames: string[] = [];

    function detectRenderWrapper(node: TSESTree.Identifier): void {
      const innerFunction = getInnermostReturningFunction(context, node);

      if (innerFunction) {
        renderWrapperNames.push(getFunctionName(innerFunction));
      }
    }

    return {
      VariableDeclarator(node) {
        if (!node.init) {
          return;
        }
        const initIdentifierNode = getDeepestIdentifierNode(node.init);

        if (!initIdentifierNode || initIdentifierNode.name === 'console') {
          return;
        }

        const isRenderWrapperVariableDeclarator = initIdentifierNode
          ? renderWrapperNames.includes(initIdentifierNode.name)
          : false;

        if (
          !helpers.isRenderVariableDeclarator(node) &&
          !isRenderWrapperVariableDeclarator
        ) {
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
              const identifierNode = getDeepestIdentifierNode(property.value);

              if (identifierNode) {
                suspiciousDebugVariableNames.push(identifierNode.name);
              }
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

        if (!callExpressionIdentifier) {
          return;
        }

        if (helpers.isRenderUtil(callExpressionIdentifier)) {
          detectRenderWrapper(callExpressionIdentifier);
        }

        const referenceNode = getReferenceNode(node);
        const referenceIdentifier = getPropertyIdentifierNode(referenceNode);

        if (!referenceIdentifier) {
          return;
        }

        const isDebugUtil =
          helpers.isDebugUtil(callExpressionIdentifier) &&
          (!isMemberExpression(node.callee) ||
            !ASTUtils.isIdentifier(node.callee.object) ||
            node.callee.object.name !== 'console');
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
