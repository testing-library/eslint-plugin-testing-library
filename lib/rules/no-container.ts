import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  getDeepestIdentifierNode,
  getFunctionName,
  getInnermostReturningFunction,
  isMemberExpression,
  isObjectPattern,
  isProperty,
} from '../node-utils';

export const RULE_NAME = 'no-container';
export type MessageIds = 'noContainer';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the use of `container` methods',
      recommendedConfig: {
        dom: false,
        angular: 'error',
        react: 'error',
        vue: 'error',
      },
    },
    messages: {
      noContainer:
        'Avoid using container methods. Prefer using the methods from Testing Library, such as "getByRole()"',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    const destructuredContainerPropNames: string[] = [];
    const renderWrapperNames: string[] = [];
    let renderResultVarName: string | null = null;
    let containerName: string | null = null;
    let containerCallsMethod = false;

    function detectRenderWrapper(node: TSESTree.Identifier): void {
      const innerFunction = getInnermostReturningFunction(context, node);

      if (innerFunction) {
        renderWrapperNames.push(getFunctionName(innerFunction));
      }
    }

    function showErrorIfChainedContainerMethod(
      innerNode: TSESTree.MemberExpression
    ) {
      if (isMemberExpression(innerNode)) {
        if (ASTUtils.isIdentifier(innerNode.object)) {
          const isContainerName = innerNode.object.name === containerName;

          if (isContainerName) {
            context.report({
              node: innerNode,
              messageId: 'noContainer',
            });
            return;
          }

          const isRenderWrapper = innerNode.object.name === renderResultVarName;
          containerCallsMethod =
            ASTUtils.isIdentifier(innerNode.property) &&
            innerNode.property.name === 'container' &&
            isRenderWrapper;

          if (containerCallsMethod) {
            context.report({
              node: innerNode.property,
              messageId: 'noContainer',
            });
            return;
          }
        }
        showErrorIfChainedContainerMethod(
          innerNode.object as TSESTree.MemberExpression
        );
      }
    }

    return {
      CallExpression(node) {
        const callExpressionIdentifier = getDeepestIdentifierNode(node);

        if (!callExpressionIdentifier) {
          return;
        }

        if (helpers.isRenderUtil(callExpressionIdentifier)) {
          detectRenderWrapper(callExpressionIdentifier);
        }

        if (isMemberExpression(node.callee)) {
          showErrorIfChainedContainerMethod(node.callee);
        } else if (
          ASTUtils.isIdentifier(node.callee) &&
          destructuredContainerPropNames.includes(node.callee.name)
        ) {
          context.report({
            node,
            messageId: 'noContainer',
          });
        }
      },

      VariableDeclarator(node) {
        if (!node.init) {
          return;
        }
        const initIdentifierNode = getDeepestIdentifierNode(node.init);

        if (!initIdentifierNode) {
          return;
        }

        const isRenderWrapperVariableDeclarator = renderWrapperNames.includes(
          initIdentifierNode.name
        );

        if (
          !helpers.isRenderVariableDeclarator(node) &&
          !isRenderWrapperVariableDeclarator
        ) {
          return;
        }

        if (isObjectPattern(node.id)) {
          const containerIndex = node.id.properties.findIndex(
            (property) =>
              isProperty(property) &&
              ASTUtils.isIdentifier(property.key) &&
              property.key.name === 'container'
          );

          const nodeValue =
            containerIndex !== -1 && node.id.properties[containerIndex].value;

          if (!nodeValue) {
            return;
          }

          if (ASTUtils.isIdentifier(nodeValue)) {
            containerName = nodeValue.name;
          } else if (isObjectPattern(nodeValue)) {
            nodeValue.properties.forEach(
              (property) =>
                isProperty(property) &&
                ASTUtils.isIdentifier(property.key) &&
                destructuredContainerPropNames.push(property.key.name)
            );
          }
        } else if (ASTUtils.isIdentifier(node.id)) {
          renderResultVarName = node.id.name;
        }
      },
    };
  },
});
