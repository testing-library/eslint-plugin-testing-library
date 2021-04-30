import {
  getDeepestIdentifierNode,
  getFunctionName,
  getInnermostReturningFunction,
  getPropertyIdentifierNode,
  getReferenceNode,
  isCallExpression,
  isObjectPattern,
  isProperty,
} from '../node-utils';
import { DEBUG_UTILS } from '../utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';
import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';

export const RULE_NAME = 'no-debug';
export type MessageIds = 'noDebug';
type Options = [{ utilNames?: Array<typeof DEBUG_UTILS[number]> }];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary debug usages in the tests',
      category: 'Best Practices',
      recommendedConfig: {
        dom: false,
        angular: 'error',
        react: 'error',
        vue: 'error',
      },
    },
    messages: {
      noDebug: 'Unexpected debug statement',
    },
    schema: [
      {
        type: 'object',
        properties: {
          utilNames: {
            type: 'array',
            items: {
              type: 'string',
              enum: DEBUG_UTILS,
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ utilNames: ['debug', 'logTestingPlaygroundURL'] }],

  create(context, [{ utilNames }], helpers) {
    const suspiciousDebugVariableNames: string[] = [];
    const suspiciousReferenceNodes: TSESTree.Identifier[] = [];
    const renderWrapperNames: string[] = [];
    const builtInConsoleNodes: TSESTree.VariableDeclarator[] = [];

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

        if (!initIdentifierNode) {
          return;
        }

        if (initIdentifierNode.name === 'console') {
          builtInConsoleNodes.push(node);
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
              (utilNames as string[]).includes(property.key.name)
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

        const isDebugUtil = helpers.isDebugUtil(
          callExpressionIdentifier,
          utilNames
        );
        const isDeclaredDebugVariable = suspiciousDebugVariableNames.includes(
          callExpressionIdentifier.name
        );
        const isChainedReferenceDebug = suspiciousReferenceNodes.some(
          (suspiciousReferenceIdentifier) => {
            return (
              (utilNames as string[]).includes(callExpressionIdentifier.name) &&
              suspiciousReferenceIdentifier.name === referenceIdentifier.name
            );
          }
        );

        const isVariableFromBuiltInConsole = builtInConsoleNodes.some(
          (variableDeclarator) => {
            const variables = context.getDeclaredVariables(variableDeclarator);
            return variables.some(
              ({ name }) =>
                name === callExpressionIdentifier.name &&
                isCallExpression(callExpressionIdentifier.parent)
            );
          }
        );

        if (
          !isVariableFromBuiltInConsole &&
          (isDebugUtil || isDeclaredDebugVariable || isChainedReferenceDebug)
        ) {
          context.report({
            node: callExpressionIdentifier,
            messageId: 'noDebug',
          });
        }
      },
    };
  },
});
